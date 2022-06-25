import * as yup from 'yup';
import { setLocale } from 'yup';
import _ from 'lodash';
import axios from 'axios';
import i18next from 'i18next';
import initWatchedState from './view.js';
import ru from './locales/ru.js';

const i18nextInstance = i18next.createInstance();
const proxy = 'https://allorigins.hexlet.app/get?disableCache=true&url=';
const setUrlWithProxy = (url) => new URL(`${proxy}${encodeURIComponent(`${url}`)}`).href;

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
  feedsNumber: 0,
  posts: [],
  feeds: [],
  openedModalId: null,
  watchedPosts: [],
};

const watchedState = initWatchedState(i18nextInstance, state);
const form = document.querySelector('form');
const postsBlock = document.querySelector('.posts');

function parse(stringContainingXMLSource) {
  const parser = new DOMParser();
  const doc = parser.parseFromString(stringContainingXMLSource, 'application/xml');
  return {
    posts: Array.from(doc.querySelectorAll('item')),
    channel: doc.querySelector('channel'),
  };
}

function rssDownload(url) {
  axios.get(setUrlWithProxy(url))
    .then((response) => {
      if (response.status === 200) {
        return response.data;
      }
      throw new Error('Network response was not ok.');
    })
    .then((data) => parse(data.contents))
    .catch(() => {
      watchedState.form.state = STATUS.error;
      watchedState.errorMessage = i18nextInstance.t('feedback.errorNetwork');
    })
    .then(({ posts, channel }) => {
      const dataPosts = posts.map((item) => {
        const newItem = item;
        return ({
          data: newItem, id: _.uniqueId(), status: 'unread', url,
        });
      });
      watchedState.posts = [...dataPosts, ...state.posts];
      if (channel === null) {
        throw new Error('Rss not found');
      }
      const feed = {
        title: channel.querySelector('title'),
        description: channel.querySelector('description'),
        id: _.uniqueId(),
      };
      watchedState.dataDescription = channel.querySelector('description');
      watchedState.dataTitle = channel.querySelector('title');
      watchedState.feeds = [...state.feeds, feed];
      watchedState.feedsNumber += 1;
      watchedState.form.state = STATUS.success;
    })
    .catch(() => {
      watchedState.form.state = STATUS.error;
      watchedState.errorMessage = i18nextInstance.t('feedback.errorRssNotFound');
    });
}

function checkNewPosts() {
  const urls = Array.from(new Set(state.posts.map((item) => item.url)))
    .filter((item) => item !== undefined);
  if (urls.length === 0) {
    setTimeout(checkNewPosts, 5000);
  } else {
    urls.forEach((url) => {
      axios.get(setUrlWithProxy(url))
        .then((response) => {
          if (response.status === 200) return response.data;
          throw new Error('Network response was not ok.');
        })
        .catch(() => {
          watchedState.form.state = STATUS.error;
          watchedState.errorMessage = i18nextInstance.t('feedback.errorRssNotFound');
        })
        .then((data) => {
          const { posts } = parse(data.contents);
          const oldPostsDates = state.posts.map((item) => item.data.querySelector('pubDate').textContent);
          const newDataPosts = posts.filter((item) => !oldPostsDates.includes(item.querySelector('pubDate').textContent));
          const newPosts = newDataPosts.map((item) => ({
            data: item, id: _.uniqueId(), status: 'unread', url,
          }));
          watchedState.posts = [...newPosts, ...state.posts];
        })
        .catch(() => {
          watchedState.form.state = STATUS.error;
          watchedState.errorMessage = i18nextInstance.t('feedback.errorNetwork');
        })
        .then(() => {
          if (url === urls[urls.length - 1]) {
            setTimeout(checkNewPosts, checkNewPostTimeout);
          }
        });
    });
  }
}

checkNewPosts();

export default () => {
  setLocale({
    string: {
      url: 'Ссылка должна быть валидным URL',
    },
  });

  i18nextInstance.init({
    lng: 'ru',
    debug: true,
    resources: {
      ru,
    },
  }).then(() => {
    form.addEventListener('submit', (e) => {
      const addedUrls = Array.from(new Set(state.posts.map((item) => item.url)))
        .filter((item) => item !== undefined);
      e.preventDefault();
      watchedState.form.state = STATUS.submitting;
      const formData = new FormData(form);
      const url = formData.get('url');
      const schema = yup.string().url().required().notOneOf(addedUrls, 'RSS уже существует');
      schema.validate(url)
        .then(() => {
          rssDownload(url);
          formData.set('url', '');
        })
        .catch((err) => {
          watchedState.form.state = STATUS.error;
          if (err.errors[0] === 'RSS уже существует') {
            watchedState.errorMessage = i18nextInstance.t('feedback.errorUrlExist');
          } else {
            watchedState.errorMessage = i18nextInstance.t(err.errors[0]);
          }
        });
    });

    postsBlock.addEventListener('click', (e) => {
      const clickId = e.path[0].dataset.id;
      if (clickId !== undefined) {
        const index = _.findIndex(state.posts, (post) => post.id === clickId);
        watchedState.openedModalId = clickId;
        watchedState.posts[index].status = 'read';
        watchedState.watchedPosts.push(clickId);
      }
    });
  });
};
