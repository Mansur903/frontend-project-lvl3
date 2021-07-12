import i18next from 'i18next';
import onChange from 'on-change';

const feedsBlock = document.querySelector('.feeds');
const postsBlock = document.querySelector('.posts');

const listGroupUlFeeds = document.createElement('ul');
listGroupUlFeeds.classList.add('list-group', 'border-0', 'rounded-0');

const listGroupUlPosts = document.createElement('ul');
listGroupUlFeeds.classList.add('list-group', 'border-0', 'rounded-0');

export const state = {
  addedUrls: {},
  feedsNumber: 0,
  appStatus: 'idle', // idle, success, error
};

export const textField = document.querySelector('.form-control');

export function setInputFieldStatus(status, errorMessage) {
  const errorField = document.querySelector('.feedback');
  switch (status) {
    case 'idle':
      textField.classList.remove('border', 'border-2', 'border-danger');
      errorField.textContent = '';
      break;
    case 'success':
      textField.classList.remove('border', 'border-2', 'border-danger');
      textField.value = '';
      errorField.classList.remove('text-danger');
      errorField.classList.add('text-success');
      errorField.textContent = i18next.t('feedback.success');
      break;
    case 'error':
      errorField.classList.remove('text-success');
      errorField.classList.add('text-danger');
      textField.classList.add('border', 'border-3', 'border-danger');
      errorField.textContent = errorMessage;
      break;
    default:
  }
}

// -------------------------------------------------------- Генерация блока фидов и постов
export default function createFeedsAndPostsBlock(arg) {
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
export function addFeeds(title, description) {
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
export function addPosts(items) {
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
