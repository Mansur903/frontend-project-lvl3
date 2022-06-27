import * as yup from 'yup';
import _ from 'lodash';
import axios from 'axios';
import i18next from 'i18next';
import initWatchedState from './view.js';
import ru from './locales/ru.js';
import parse from './parser.js';
import yupLocale from './locales/yupLocale.js';

const proxy = {
  host: 'https://allorigins.hexlet.app',
  path: 'get',
  disableCash: true,
};

const setUrlWithProxy = (url) => {
  const urlConstructor = new URL(`${proxy.path}`, `${proxy.host}`);
  urlConstructor.searchParams.append('disableCache', `${proxy.disableCash}`);
  urlConstructor.searchParams.append('url', `${url}`);
  return urlConstructor.href;
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
    errorMessage: '',
  },
  modal: {
    postId: null,
  },
  feedsNumber: 0,
  posts: [],
  feeds: [],
  watchedPosts: [],
};

function downloadRss(url, stateChanger, i18nextInstance) {
  const watchedState = stateChanger;
  axios.get(setUrlWithProxy(url))
    .then((response) => response.data)
    .then((data) => parse(data.contents))
    .then(({ title, description, posts }) => {
      const dataPosts = posts.map((post) => {
        const newItem = post.item;
        return ({
          data: newItem, id: _.uniqueId(), url, pubDate: post.pubDate,
        });
      });
      watchedState.posts = [...dataPosts, ...state.posts];
      const feed = {
        title,
        description,
        id: _.uniqueId(),
        url,
      };
      watchedState.dataDescription = description;
      watchedState.dataTitle = title;
      watchedState.feeds = [...state.feeds, feed];
      watchedState.feedsNumber += 1;
      watchedState.form.state = STATUS.success;
    })
    .catch((e) => {
      watchedState.form.state = STATUS.error;
      switch (e.type) {
        case 'empty-doc':
          watchedState.errorMessage = i18nextInstance.t('feedback.errorRssNotFound');
          break;
        default:
          watchedState.errorMessage = i18nextInstance.t('feedback.errorNetwork');
      }
    });
}

function fetchNewPosts(stateChanger, i18nextInstance) {
  const watchedState = stateChanger;
  const urls = state.feeds.map((item) => item.url);
  if (urls.length === 0) {
    setTimeout(() => fetchNewPosts(watchedState, i18nextInstance), 5000);
  } else {
    Promise.all(urls.map((url) => axios.get(setUrlWithProxy(url))
      .then(({ data }) => {
        const { posts } = parse(data.contents);
        const oldPostsDates = state.posts.map((post) => post.pubDate);
        const postsDiff = posts.filter((post) => !oldPostsDates.includes(post.pubDate));
        const newPosts = postsDiff.map((post) => ({
          data: post.item, id: _.uniqueId(), url, pubDate: post.pubDate,
        }));
        return newPosts;
      })
      .catch((e) => {
        watchedState.form.state = STATUS.error;
        switch (e.type) {
          case 'empty-doc':
            watchedState.errorMessage = i18nextInstance.t('feedback.errorRssNotFound');
            break;
          default:
            watchedState.errorMessage = i18nextInstance.t('feedback.errorNetwork');
        }
      })))
      .then((newPosts) => {
        watchedState.posts = [...newPosts[0], ...state.posts];
        setTimeout(() => fetchNewPosts(watchedState), checkNewPostTimeout);
      });
  }
}

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
  yupLocale();
  const i18nextInstance = i18next.createInstance();
  const watchedState = initWatchedState(i18nextInstance, state, domElements);
  setTimeout(() => fetchNewPosts(watchedState, i18nextInstance), checkNewPostTimeout);

  i18nextInstance.init({
    lng: 'ru',
    debug: true,
    resources: {
      ru,
    },
  }).then(() => {
    domElements.form.addEventListener('submit', (e) => {
      e.preventDefault();
      const addedUrls = state.feeds.map((item) => item.url);
      watchedState.form.state = STATUS.submitting;
      const formData = new FormData(domElements.form);
      const url = formData.get('url');
      const schema = yup.string().url().required().notOneOf(addedUrls);
      schema.validate(url)
        .then(() => {
          downloadRss(url, watchedState, i18nextInstance);
          formData.set('url', '');
        })
        .catch((err) => {
          watchedState.form.state = STATUS.error;
          switch (err.errors[0]) {
            case ('rssExists'):
              watchedState.errorMessage = i18nextInstance.t('feedback.errorUrlExist');
              break;
            case ('invalidUrl'):
              watchedState.errorMessage = i18nextInstance.t('feedback.errorUrlInvalid');
              break;
            default:
              watchedState.errorMessage = i18nextInstance.t(`feedback.${err.errors[0]}`);
          }
        });
    });

    domElements.postsBlock.addEventListener('click', (e) => {
      const { id } = e.target.dataset;
      if (id === undefined) {
        return;
      }
      watchedState.modal.postId = id;
      watchedState.watchedPosts.push(id);
    });
  });
};
