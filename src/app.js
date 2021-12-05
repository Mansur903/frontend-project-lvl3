import 'bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import * as yup from 'yup';
import _ from 'lodash';
import i18next from 'i18next';
import initWatchedState, {
  textField, modalTitle, modalDescription, readAllButton,
} from './view.js';
import getData from './utils/getData.js';
import parsing from './utils/parsing.js';
import ru from './locales/ru.js';

export default async () => {
  const i18nextInstance = i18next.createInstance();
  await i18nextInstance.init({
    lng: 'ru',
    debug: true,
    resources: {
      ru,
    },
  }).then(() => {
    const state = {
      addedUrls: {},
      feedsNumber: 0,
      appStatus: 'idle', // idle, success, error
      posts: [],
      feeds: [],
    };
    console.log(state);
    const watchedState = initWatchedState(i18nextInstance, state);

    window.addEventListener('DOMContentLoaded', () => {
      const schema = yup.string().url().required();
      // const addButton = document.querySelector('.add');
      const form = document.querySelector('form');
      console.log('form: ', form);

      let counterFeeds = 0;
      let counterPosts = 0;

      function preview(previewButton) {
        previewButton.forEach((item) => {
          item.addEventListener('click', () => {
            readAllButton.setAttribute('href', `${item.closest('.list-group-item').firstChild.href}`);
            modalTitle.textContent = item.closest('.list-group-item').firstChild.textContent;
            const { id } = item;
            watchedState.posts[id - 1].status = 'read';
            const description = state.posts.filter((post) => post.id === Number(id))[0]
              .data
              .querySelector('description')
              .textContent;
            modalDescription.textContent = description;
            document.getElementById(item.id).firstChild.classList.remove('fw-bold');
            document.getElementById(item.id).firstChild.classList.add('fw-normal');
          });
        });
      }

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
            console.log(e);
            watchedState.appStatus = 'error';
            watchedState.errorMessage = i18nextInstance.t('feedback.errorNetwork');
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
                watchedState.errorMessage = i18nextInstance.t('feedback.errorRssNotFound');
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
          console.log(e);
          watchedState.appStatus = 'error';
          watchedState.errorMessage = i18nextInstance.t('feedback.errorNetwork');
        }
      }

      form.addEventListener('submit', (e) => {
        e.preventDefault();
        watchedState.appStatus = 'submitting';
        const inputURL = textField.value;
        textField.value = '';
        if (Object.values(watchedState.addedUrls).includes(inputURL)) {
          watchedState.appStatus = 'error';
          watchedState.errorMessage = i18nextInstance.t('feedback.errorUrlExist');
          throw new Error(i18nextInstance.t('feedback.errorUrlExist'));
        } else {
          schema.validate(inputURL)
            .catch((err) => {
              console.log(err);
              watchedState.appStatus = 'error';
              watchedState.errorMessage = i18nextInstance.t('feedback.errorUrlNotValid');
              throw new Error(i18nextInstance.t('feedback.errorUrlNotValid'));
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
  });
};
