import * as yup from 'yup';
import _ from 'lodash';
import axios from 'axios';
import i18next from 'i18next';

import { ru } from './locales';
import yupLocale from './locales/yupLocale';
import initWatchedState from './view';
import parse from './parser';

const proxy = {
  host: 'https://allorigins.hexlet.app',
  path: 'get',
  disableCash: true,
};

const setUrlWithProxy = (url) => {
  const urlWithProxy = new URL(`${proxy.path}`, `${proxy.host}`);
  urlWithProxy.searchParams.append('disableCache', `${proxy.disableCash}`);
  urlWithProxy.searchParams.append('url', `${url}`);
  return urlWithProxy.href;
};

const checkNewPostTimeout = 5000;

const STATUS = {
  idle: 'idle',
  submitting: 'submitting',
  success: 'success',
  error: 'error',
};

const state = {
  form: {
    state: STATUS.idle,
    errorType: '',
  },
  modal: {
    postId: null,
  },
  posts: [],
  feeds: [],
  watchedPosts: new Set(),
};

const getLoadingProcessErrorType = (e) => {
  if (e.isParsingError) {
    return 'noRss';
  }

  if (e.isAxiosError) {
    return 'noNetwork';
  }

  if (e.isValidationError) {
    return e.errors[0];
  }

  return 'unknown';
};

const downloadRss = (url, watchedState) => {
  watchedState.form = {
    state: STATUS.submitting,
  };
  axios.get(setUrlWithProxy(url))
    .then((response) => {
      const {
        title, description, posts,
      } = parse(response.data.contents);
      const feedId = _.uniqueId();
      const dataPosts = posts.map((post) => {
        const { postTitle, postDescription, link } = post;
        return ({
          postTitle, postDescription, id: _.uniqueId(), feedId, pubDate: post.pubDate, link,
        });
      });

      watchedState.posts = [...dataPosts, ...state.posts];
      const feed = {
        title,
        description,
        id: feedId,
        url,
      };

      watchedState.feeds.push(feed);
      watchedState.form = {
        state: STATUS.success,
      };
    })
    .catch((e) => {
      watchedState.form = {
        state: STATUS.error,
        errorType: getLoadingProcessErrorType(e),
      };
    });
};

const fetchNewPosts = (watchedState) => {
  const promises = state.feeds.map(({ url, id }) => axios.get(setUrlWithProxy(url))
    .then(({ data }) => {
      const { posts } = parse(data.contents);
      const newPosts = posts.map((post) => ({ ...post, feedId: id }));
      const oldChannelPosts = state.posts.filter((post) => post.feedId === id);
      const comparator = (firstPost, secondPost) => firstPost.pubDate === secondPost.pubDate;
      const diff = _.differenceWith(newPosts, oldChannelPosts, comparator);
      const diffWithId = diff.map((item) => ({ ...item, id: _.uniqueId() }));
      watchedState.posts.unshift(..._.flatten(diffWithId));
    })
    .catch((e) => console.log(e)));

  Promise.all(promises)
    .finally(() => setTimeout(() => fetchNewPosts(watchedState), checkNewPostTimeout));
};

export default () => {
  const domElements = {
    listGroupUlPosts: document.querySelector('.ul-posts'),
    listGroupUlFeeds: document.querySelector('.ul-feeds'),
    feedsBlock: document.querySelector('.feeds'),
    postsBlock: document.querySelector('.posts'),
    feedback: document.querySelector('.feedback'),
    textField: document.querySelector('.form-control'),
    readAllButton: document.querySelector('.read-all'),
    modalTitle: document.querySelector('.modal-title'),
    modalDescription: document.querySelector('.modal-description'),
    form: document.querySelector('form'),
    submittingButton: document.querySelector('.submitting-button'),
  };

  const i18nextInstance = i18next.createInstance();

  i18nextInstance.init({
    lng: 'ru',
    debug: true,
    resources: {
      ru,
    },
  }).then(() => {
    yup.setLocale(yupLocale);
    const watchedState = initWatchedState(i18nextInstance, state, domElements);
    setTimeout(() => fetchNewPosts(watchedState, i18nextInstance), checkNewPostTimeout);
    domElements.form.addEventListener('submit', (e) => {
      e.preventDefault();
      const addedUrls = state.feeds.map((item) => item.url);
      const formData = new FormData(domElements.form);
      const url = formData.get('url');
      const schema = yup.string().url().required().notOneOf(addedUrls);
      schema.validate(url)
        .then(() => {
          downloadRss(url, watchedState);
          formData.set('url', '');
        })
        .catch((err) => {
          err.isValidationError = true;
          watchedState.form = {
            state: STATUS.error,
            errorType: getLoadingProcessErrorType(err),
          };
        });
    });

    domElements.postsBlock.addEventListener('click', (e) => {
      const { id } = e.target.dataset;
      if (id === undefined) {
        return;
      }
      watchedState.modal.postId = id;
      watchedState.watchedPosts.add(id);
    });
  });
};
