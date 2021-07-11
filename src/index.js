import 'bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import * as yup from 'yup';
import i18next from 'i18next';
import { setLocale } from 'yup';

const state = {
  addedUrls: {},
  feedsNumber: 0,
  appStatus: 'idle', // idle, success, error
};

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
          urlWarning: 'Ссылка должна быть валидным URL',
        },
      },
    },
  },
});
runApp();

const addButton = document.querySelector('.btn');
const textField = document.querySelector('.form-control');
const feedsBlock = document.querySelector('.feeds');
const postsBlock = document.querySelector('.posts');
const errorField = document.querySelector('.feedback');

const listGroupUlFeeds = document.createElement('ul');
listGroupUlFeeds.classList.add('list-group', 'border-0', 'rounded-0');

const listGroupUlPosts = document.createElement('ul');
listGroupUlFeeds.classList.add('list-group', 'border-0', 'rounded-0');

// -------------------------------------------------------- Генерация блока фидов и постов
function createFeedsAndPostsBlock(arg) {
  const cardDiv = document.createElement('div');
  const cardBodyDiv = document.createElement('div');
  const cardTitleHeader = document.createElement('h2');

  cardDiv.classList.add('card', 'border-0');
  cardBodyDiv.classList.add('card-body');

  cardTitleHeader.classList.add('card-title', 'h4');

  cardDiv.append(cardBodyDiv);
  cardBodyDiv.append(cardTitleHeader);

  if (arg === 'feeds') {
    cardTitleHeader.textContent = i18next.t('feeds.feedsHeader');
    feedsBlock.append(cardDiv);
    cardDiv.append(listGroupUlFeeds);
  } else {
    cardTitleHeader.textContent = i18next.t('posts.postsHeader');
    postsBlock.append(cardDiv);
    cardDiv.append(listGroupUlPosts);
  }
}
// -------------------------------------------------------- Добавление фидов
function addFeeds(title, description) {
  const listGroupItemLi = document.createElement('li');
  const titleH3 = document.createElement('h3');
  const descriptionP = document.createElement('p');

  titleH3.textContent = title;
  descriptionP.textContent = description;

  titleH3.classList.add('h6', 'm-0');
  descriptionP.classList.add('m-0', 'text-black-50');
  listGroupItemLi.classList.add('list-group-item', 'border-0', 'border-end-0');

  listGroupUlFeeds.append(listGroupItemLi);
  listGroupItemLi.append(titleH3);
  listGroupItemLi.append(descriptionP);
}
// -------------------------------------------------------- Добавление постов
function addPosts(items) {
  items.forEach((item) => {
    const itemTitle = item.querySelector('title');
    const postUrl = item.querySelector('link');
    const listGroupItemLi = document.createElement('li');
    const aElem = document.createElement('a');
    const itemButton = document.createElement('button');

    listGroupItemLi.classList.add('list-group-item', 'd-flex', 'justify-content-between', 'align-items-start', 'border-0', 'border-end-0');
    aElem.classList.add('fw-bold');
    itemButton.classList.add('btn', 'btn-outline-primary', 'btn-sm');

    itemButton.setAttribute('type', 'button');
    aElem.setAttribute('href', postUrl.textContent);

    itemButton.textContent = 'Просмотр';
    aElem.textContent = itemTitle.textContent;
    listGroupItemLi.append(aElem);
    listGroupItemLi.append(itemButton);
    listGroupUlPosts.append(listGroupItemLi);
  });
}
// --------------------------------------------------------

function parsing(stringContainingXMLSource) {
  const parser = new DOMParser();
  return parser.parseFromString(stringContainingXMLSource, 'application/xml');
}

addButton.addEventListener('click', () => {
  textField.classList.remove('border', 'border-2', 'border-danger');
  errorField.textContent = '';
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
          textField.classList.add('border', 'border-3', 'border-danger');
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
    textField.value = '';
  } catch (e) {
    textField.classList.add('border', 'border-3', 'border-danger');
    errorField.textContent = e.errors;
    console.log(e);
  }
});
