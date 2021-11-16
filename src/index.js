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

const schema = yup.string().url();

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

// -------------------------------------------------------- Контроллер
addButton.addEventListener('click', () => {
  watchedState.appStatus = 'idle';
  const inputURL = textField.value;
  try {
    schema.validateSync(inputURL);
  } catch (e) {
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

  try {
    fetch(`https://hexlet-allorigins.herokuapp.com/get?disableCache=true&url=${encodeURIComponent(`${inputURL}`)}`)
      .then((response) => {
        if (response.ok) return response.json();
        throw new Error('Network response was not ok.');
      })
      .then((data) => parsing(data.contents))
      .then((doc) => {
        const dataPosts = Array.from(doc.querySelectorAll('item'));
        watchedState.posts = [...state.posts, ...dataPosts];
        const dataChannel = doc.querySelector('channel');
        if (dataChannel === null) {
          watchedState.appStatus = 'error';
          watchedState.errorMessage = i18next.t('feedback.errorRssNotFound');
          throw new Error(i18next.t('feedback.errorRssNotFound'));
        }
        const feed = {
          title: dataChannel.querySelector('title'),
          description: dataChannel.querySelector('description'),
        };
        watchedState.dataDescription = dataChannel.querySelector('description');
        watchedState.dataTitle = dataChannel.querySelector('title');
        watchedState.feeds = [...state.feeds, feed];
        watchedState.feedsNumber += 1;
        watchedState.appStatus = 'success';
        console.log(state);
      });
  } catch (e) {
    watchedState.appStatus = 'error';
    watchedState.errorMessage = e.errors;
  }
});
