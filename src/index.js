import 'bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import * as yup from 'yup';
import i18next from 'i18next';
import { setLocale } from 'yup';
import createFeedsAndPostsBlock, {
  addFeeds, addPosts, state, setInputFieldStatus, textField,
} from './view.js';

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
  setInputFieldStatus('idle');
  const inputURL = textField.value;
  try {
    schema.validateSync(inputURL);
    fetch(`https://hexlet-allorigins.herokuapp.com/get?url=${encodeURIComponent(`${inputURL}`)}`)
      .then((response) => {
        if (response.ok) return response.json();
        throw new Error('Network response was not ok.');
      })
      .then((data) => parsing(data.contents))
      .then((doc) => {
        // eslint-disable-next-line no-prototype-builtins
        if (state.addedUrls.hasOwnProperty(inputURL)) {
          setInputFieldStatus('error');
          throw new Error('url exist');
        }
        state.dataItems = doc.querySelectorAll('item');
        state.dataChannel = doc.querySelector('channel');
        state.dataTitle = state.dataChannel.querySelector('title');
        state.dataDescription = state.dataChannel.querySelector('description');
        if (state.feedsNumber === 0) {
          createFeedsAndPostsBlock('feeds');
          createFeedsAndPostsBlock('posts');
        }
        addFeeds(state.dataTitle.textContent, state.dataDescription.textContent);
        addPosts(state.dataItems);
        state.addedUrls[inputURL] = inputURL;
        state.feedsNumber += 1;
        console.log(state);
        console.log(state.feedsNumber);
      });
    setInputFieldStatus('success');
  } catch (e) {
    setInputFieldStatus('error', e.errors);
  }
});
