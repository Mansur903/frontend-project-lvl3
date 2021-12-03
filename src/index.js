import 'bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import * as yup from 'yup';
import _ from 'lodash';
import i18next from 'i18next';
import { state, textField, watchedState } from './view.js';
import preview from './utils/preview.js';
import getData from './utils/getData.js';
import parsing from './utils/parsing.js';
import ru from './locales/ru.js';

const runApp = async () => {
  i18next.init({
    lng: 'ru',
    debug: true,
    resources: {
      ru,
    },
  });

  window.addEventListener('DOMContentLoaded', () => {
    const schema = yup.string().url().required();
    const addButton = document.querySelector('.add');

    let counterFeeds = 0;
    let counterPosts = 0;

    function checkNewPosts() {
      const urls = Object.values(state.addedUrls);
      urls.forEach((url) => {
        try {
          getData(url)
            .then((data) => parsing(data.contents))
            .then((doc) => {
              const newDataPosts = Array.from(doc.querySelectorAll('item')).filter((item) => {
                let isNewPost = true;
                state.posts.forEach((post) => {
                  if (post.data.textContent === item.textContent) {
                    isNewPost = false;
                  }
                });
                return isNewPost;
              });
              return newDataPosts;
            })
            .then((newDataPosts) => {
              const newPosts = newDataPosts.map((item) => {
                counterPosts += 1;
                return ({ data: item, id: counterPosts, status: 'unread' });
              });
              watchedState.posts = [...newPosts, ...state.posts];
              state.posts.forEach((post) => {
                if (post.status === 'read') {
                  document.getElementById(post.id).firstChild.classList.remove('fw-bold');
                  document.getElementById(post.id).firstChild.classList.add('fw-normal');
                }
              });
            })
            .then(() => {
              const previewButton = document.querySelectorAll('.preview');
              preview(previewButton);
            })
            .then(() => {
              if (url === urls[urls.length - 1]) {
                setTimeout(checkNewPosts, 5000);
              }
            });
        } catch (e) {
          watchedState.appStatus = 'error';
          watchedState.errorMessage = i18next.t('feedback.errorNetwork');
        }
      });
    }

    function makeRequest(url) {
      try {
        getData(url)
          .then((data) => parsing(data.contents))
          .then((doc) => {
            const dataPosts = Array.from(doc.querySelectorAll('item')).map((item) => {
              const newItem = item;
              counterPosts += 1;
              return ({ data: newItem, id: counterPosts, status: 'unread' });
            });
            watchedState.posts = [...state.posts, ...dataPosts];
            const dataChannel = doc.querySelector('channel');
            if (dataChannel === null) {
              watchedState.appStatus = 'error';
              watchedState.errorMessage = i18next.t('feedback.errorRssNotFound');
              watchedState.addedUrls = _.remove(state.addedUrls, (item) => item === url);
              throw new Error(i18next.t('feedback.errorRssNotFound'));
            }
            const feed = {
              title: dataChannel.querySelector('title'),
              description: dataChannel.querySelector('description'),
              id: counterFeeds,
            };
            counterFeeds += 1;
            watchedState.dataDescription = dataChannel.querySelector('description');
            watchedState.dataTitle = dataChannel.querySelector('title');
            watchedState.feeds = [...state.feeds, feed];
            watchedState.feedsNumber += 1;
            watchedState.appStatus = 'success';
          })
          .then(() => {
            const previewButton = document.querySelectorAll('.preview');
            preview(previewButton);
          });
      } catch (e) {
        watchedState.appStatus = 'error';
        watchedState.errorMessage = i18next.t('feedback.errorNetwork');
      }
    }

    addButton.addEventListener('click', (e) => {
      e.preventDefault();
      watchedState.appStatus = 'idle';
      const inputURL = textField.value;
      textField.value = '';
      if (Object.values(watchedState.addedUrls).includes(inputURL)) {
        watchedState.appStatus = 'error';
        watchedState.errorMessage = i18next.t('feedback.errorUrlExist');
        throw new Error(i18next.t('feedback.errorUrlExist'));
      } else {
        schema.validate(inputURL)
          .catch(() => {
            watchedState.appStatus = 'error';
            watchedState.errorMessage = i18next.t('feedback.errorUrlNotValid');
            console.log('state: ', state);
            throw new Error(i18next.t('feedback.errorUrlNotValid'));
          })
          .then(() => {
            watchedState.addedUrls[_.uniqueId()] = inputURL;
            makeRequest(inputURL);
            if (Object.values(state.addedUrls).length === 1) {
              checkNewPosts();
            }
          });
      }
    });
  });
};

runApp();
export default runApp;
