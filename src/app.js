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

const downloadRss = (url, watchedState) => {
  axios.get(setUrlWithProxy(url))
    .then((response) => {
      const {
        title, description, posts,
      } = parse(response.data.contents);
      const feedId = _.uniqueId();
      const dataPosts = posts.map((post) => {
        const { postTitle, postDescription, modalLink } = post;
        return ({
          postTitle, postDescription, id: _.uniqueId(), feedId, pubDate: post.pubDate, modalLink,
        });
      });

      watchedState.posts = [...dataPosts, ...state.posts];
      const feed = {
        title,
        description,
        id: feedId,
        url,
      };

      watchedState.feeds = [...state.feeds, feed];
      watchedState.form.state = STATUS.success;
    })
    .catch((e) => {
      const errorType = e.type;
      watchedState.form.state = STATUS.error;
      watchedState.form.errorType = errorType;
    });
};

const fetchNewPosts = (watchedState) => {
  const promises = state.feeds.map(({ url, id }) => axios.get(setUrlWithProxy(url))
    .then(({ data }) => {
      const { posts } = parse(data.contents);
      posts.forEach((post) => { post.feedId = id; });
      const oldChannelPosts = state.posts.filter((post) => post.feedId === id);
      const comparator = (arrVal, othVal) => arrVal.pubDate === othVal.pubDate;
      const diff = _.differenceWith(posts, oldChannelPosts, comparator);
      diff.forEach((item) => { item.id = _.uniqueId(); });
      return diff;
    })
    .catch(() => []));

  Promise.all(promises)
    .then((diff) => {
      watchedState.posts.unshift(..._.flatten(diff));
    })
    .finally(() => setTimeout(() => fetchNewPosts(watchedState), checkNewPostTimeout));
};

export default () => {
  const domElements = {
    listGroupUlPosts: document.querySelector('.ul-posts'),
    listGroupUlFeeds: document.querySelector('.ul-feeds'),
    feedsBlock: document.querySelector('.feeds'),
    postsBlock: document.querySelector('.posts'),
    errorField: document.querySelector('.feedback'),
    textField: document.querySelector('.form-control'),
    readAllButton: document.querySelector('.read-all'),
    modalTitle: document.querySelector('.modal-title'),
    modalDescription: document.querySelector('.modal-description'),
    form: document.querySelector('form'),
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
      watchedState.form.state = STATUS.submitting;
      const formData = new FormData(domElements.form);
      const url = formData.get('url');
      const schema = yup.string().url().required().notOneOf(addedUrls);
      schema.validate(url)
        .then(() => {
          downloadRss(url, watchedState);
          formData.set('url', '');
        })
        .catch((err) => {
          watchedState.form.state = STATUS.error;
          const errorType = err.errors[0];
          watchedState.form.errorType = errorType;
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
