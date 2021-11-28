import 'bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import * as yup from 'yup';
import _ from 'lodash';
import i18next from 'i18next';
// import { setLocale } from 'yup';
import { state, textField, watchedState } from './view.js';

/* setLocale({
  string: {
    url: 'Ссылка должна быть валидным URL',
  },
});
 */

const runApp = () => i18next.init({
  lng: 'ru',
  debug: true,
  resources: {
    ru: {
      translation: {
        posts: {
          postsHeader: 'Посты',
        },
        feeds: {
          feedsHeader: 'Фиды',
        },
        feedback: {
          success: 'RSS успешно загружен',
          errorUrlNotValid: 'Ссылка должна быть валидным URL',
          errorUrlExist: 'RSS уже существует',
          errorRssNotFound: 'Ресурс не содержит валидный RSS',
          errorNetwork: 'Ошибка сети',
        },
      },
    },
  },
});
runApp();

export default function main() {
  const schema = yup.string().url().required();
  // const addButton = document.querySelector('.add');

  function parsing(stringContainingXMLSource) {
    const parser = new DOMParser();
    return parser.parseFromString(stringContainingXMLSource, 'application/xml');
  }

  let counterFeeds = 0;
  let counterPosts = 0;

  function preview(previewButton) {
    previewButton.forEach((item) => {
      item.addEventListener('click', () => {
        const modalTitle = document.querySelector('.modal-title');
        const modalDescription = document.querySelector('.modal-description');
        const readAllButton = document.querySelector('.read-all');
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
        fetch(`https://hexlet-allorigins.herokuapp.com/get?disableCache=true&url=${encodeURIComponent(`${url}`)}`)
          .then((response) => {
            if (response.ok) return response.json();
            throw new Error('Network response was not ok.');
          })
          .then((data) => parsing(data.contents))
          .then((doc) => {
            const newDataPosts = Array.from(doc.querySelectorAll('item')).filter((item) => {
              let addPost = true;
              state.posts.forEach((post) => {
                if (post.data.textContent === item.textContent) {
                  addPost = false;
                }
              });
              return addPost;
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
      fetch(`https://hexlet-allorigins.herokuapp.com/get?disableCache=true&url=${encodeURIComponent(`${url}`)}`)
        .then((response) => {
          if (response.ok) return response.json();
          throw new Error('Network response was not ok.');
        })
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

  document.querySelector('.add').addEventListener('click', (e) => {
    e.preventDefault();
    watchedState.appStatus = 'idle';
    const inputURL = textField.value;
    textField.value = '';
    try {
      schema.validate(inputURL)
        .then(() => {
          makeRequest(inputURL);
          if (Object.values(state.addedUrls).length === 1) {
            checkNewPosts();
          }
        });
    } catch {
      watchedState.appStatus = 'error';
      watchedState.errorMessage = i18next.t('feedback.errorUrlNotValid');
      throw new Error(i18next.t('feedback.errorUrlNotValid'));
    }
    if (Object.values(watchedState.addedUrls).includes(inputURL)) {
      watchedState.appStatus = 'error';
      watchedState.errorMessage = i18next.t('feedback.errorUrlExist');
      throw new Error(i18next.t('feedback.errorUrlExist'));
    } else {
      watchedState.addedUrls[_.uniqueId()] = inputURL;
    }
  });
}
main();
