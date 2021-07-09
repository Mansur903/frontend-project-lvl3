import 'bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import * as yup from 'yup';

const schema = yup.string().url();

const addButton = document.querySelector('.btn');
const textField = document.querySelector('.form-control');
const feedsBlock = document.querySelector('.feeds');
const postsBlock = document.querySelector('.posts');

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
    cardTitleHeader.textContent = 'Фиды';
    feedsBlock.append(cardDiv);
    cardDiv.append(listGroupUlFeeds);
  } else {
    cardTitleHeader.textContent = 'Посты';
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
  const doc = parser.parseFromString(stringContainingXMLSource, 'application/xml');
  console.log(doc);
  return doc;
}

const state = {
  addedUrls: {},
};

let feedsNumber = 0;

addButton.addEventListener('click', () => {
  textField.classList.remove('border', 'border-2', 'border-danger');
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
        const items = doc.querySelectorAll('item');
        const channel = doc.querySelector('channel');
        const title = channel.querySelector('title');
        const description = channel.querySelector('description');
        if (feedsNumber === 0) {
          createFeedsAndPostsBlock('feeds');
          createFeedsAndPostsBlock('posts');
        }
        addFeeds(title.textContent, description.textContent);
        addPosts(items);
        state.addedUrls[inputURL] = inputURL;
        console.log(state);
        feedsNumber += 1;
        console.log(feedsNumber);
      });
    textField.value = '';
  } catch (e) {
    textField.classList.add('border', 'border-3', 'border-danger');
    console.log(e);
  }
});
