import 'bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import * as yup from 'yup';
import _ from 'lodash';
import i18next from 'i18next';
import { setLocale } from 'yup';
import { state, textField, watchedState } from './view.js';

const addButton = document.querySelector('.btn');

setLocale({
  string: {
    url: 'Ссылка должна быть валидным URL',
  },
});

const schema = yup.string().url().required();

const runApp = () => i18next.init({
  lng: 'ru', // Текущий язык
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
          errorUrlExist: 'Данный url уже существует',
          errorRssNotFound: 'По данной ссылке RSS канал не найден',
        },
      },
    },
  },
});
runApp();

// --------------------------------------------------------

function parsing(stringContainingXMLSource) {
  const parser = new DOMParser();
  return parser.parseFromString(stringContainingXMLSource, 'application/xml');
}
let counterFeeds = 0;
// -------------------------------------------------------- Контроллер
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
          return ({ data: newItem });
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
      });
  } catch (e) {
    watchedState.appStatus = 'error';
    watchedState.errorMessage = e.errors;
  }
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
          const newPosts = newDataPosts.map((item) => ({ data: item }));
          watchedState.posts = [...newPosts, ...state.posts];
        })
        .then(() => {
          if (url === urls[urls.length - 1]) {
            console.log(url);
            setTimeout(checkNewPosts, 5000);
          }
        });
    } catch (e) {
      watchedState.appStatus = 'error';
      watchedState.errorMessage = e.errors;
    }
  });
}

addButton.addEventListener('click', (e) => {
  e.preventDefault();
  watchedState.appStatus = 'idle';
  const inputURL = textField.value;
  textField.value = '';
  try {
    schema.validateSync(inputURL);
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
  makeRequest(inputURL);
  if (Object.values(state.addedUrls).length === 1) {
    checkNewPosts();
  }
});
