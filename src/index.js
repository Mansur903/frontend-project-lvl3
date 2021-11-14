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
          error: 'Ссылка должна быть валидным URL',
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
  schema.validateSync(inputURL);
  if (Object.values(watchedState.addedUrls).includes(inputURL)) {
    watchedState.appStatus = 'error';
    throw new Error('url exist');
  } else {
    watchedState.addedUrls[_.uniqueId()] = inputURL;
  }
  try {
    fetch(`https://hexlet-allorigins.herokuapp.com/get?url=${encodeURIComponent(`${inputURL}`)}`)
      .then((response) => {
        if (response.ok) return response.json();
        throw new Error('Network response was not ok.');
      })
      .then((data) => parsing(data.contents))
      .then((doc) => {
        watchedState.dataItems = doc.querySelectorAll('item');
        const dataChannel = doc.querySelector('channel');
        console.log('dataChannel: ', dataChannel);
        watchedState.dataDescription = dataChannel.querySelector('description');
        watchedState.dataTitle = dataChannel.querySelector('title');
        watchedState.feedsNumber += 1;
      });
    watchedState.appStatus = 'success';
  } catch (e) {
    // setInputFieldStatus('error', e.errors);
  }
  console.log('state: ', state);
});
