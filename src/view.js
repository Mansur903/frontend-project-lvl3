import onChange from 'on-change';

export const modalTitle = document.querySelector('.modal-title');
export const modalDescription = document.querySelector('.modal-description');

const listGroupUlFeeds = document.createElement('ul');
listGroupUlFeeds.classList.add('list-group', 'border-0', 'rounded-0');
const listGroupUlPosts = document.createElement('ul');
listGroupUlPosts.classList.add('list-group', 'border-0', 'rounded-0');

function setInputFieldStatus(status, errorMessage, i18nextInstance) {
  const errorField = document.querySelector('.feedback');
  const textField = document.querySelector('.form-control');
  switch (status) {
    case 'idle':
      textField.classList.remove('border', 'border-2', 'border-danger');
      errorField.textContent = '';
      textField.removeAttribute('readonly');
      document.querySelector('.add').disabled = false;
      break;
    case 'submitting':
      listGroupUlFeeds.innerHTML = '';
      listGroupUlPosts.innerHTML = '';
      textField.setAttribute('readonly', true);
      document.querySelector('.add').disabled = true;
      textField.classList.remove('border', 'border-2', 'border-danger');
      errorField.textContent = '';
      break;
    case 'success':
      textField.removeAttribute('readonly');
      document.querySelector('.add').disabled = false;
      textField.classList.remove('border', 'border-2', 'border-danger');
      textField.value = '';
      errorField.classList.remove('text-danger');
      errorField.classList.add('text-success');
      errorField.textContent = i18nextInstance.t('feedback.success');
      break;
    case 'error':
      textField.removeAttribute('readonly');
      document.querySelector('.add').disabled = false;
      errorField.classList.remove('text-success');
      errorField.classList.add('text-danger');
      textField.classList.add('border', 'border-3', 'border-danger');
      errorField.textContent = errorMessage;
      break;
    default:
  }
}

// -------------------------------------------------------- Генерация блока фидов и постов
function createFeedsAndPostsBlock(arg, i18nextInstance) {
  const feedsBlock = document.querySelector('.feeds');
  const postsBlock = document.querySelector('.posts');
  const cardDiv = document.createElement('div');
  const cardBodyDiv = document.createElement('div');
  const cardTitleHeader = document.createElement('h2');
  cardDiv.classList.add('card', 'border-0');
  cardBodyDiv.classList.add('card-body');

  cardTitleHeader.classList.add('card-title', 'h4');

  cardDiv.append(cardBodyDiv);
  cardBodyDiv.append(cardTitleHeader);

  if (arg === 'feeds') {
    cardTitleHeader.textContent = i18nextInstance.t('feeds.feedsHeader');
    feedsBlock.append(cardDiv);
    cardDiv.append(listGroupUlFeeds);
  }
  if (arg === 'posts') {
    cardTitleHeader.textContent = i18nextInstance.t('posts.postsHeader');
    postsBlock.append(cardDiv);
    cardDiv.append(listGroupUlPosts);
  }
}

// -------------------------------------------------------- Добавление фидов
function addFeeds({ title, description }) {
  const listGroupItemLi = document.createElement('li');
  const titleH3 = document.createElement('h3');
  const descriptionP = document.createElement('p');

  titleH3.textContent = title;
  descriptionP.textContent = description;

  titleH3.classList.add('h6', 'm-0');
  descriptionP.classList.add('m-0', 'text-black-50');
  listGroupItemLi.classList.add('list-group-item', 'border-0', 'border-end-0');
  listGroupItemLi.append(titleH3);
  listGroupItemLi.append(descriptionP);
  listGroupUlFeeds.append(listGroupItemLi);
}

// -------------------------------------------------------- Добавление постов
function addPosts(items) {
  listGroupUlPosts.innerHTML = '';
  items.forEach(({ data, id }) => {
    const itemTitle = data.querySelector('title');
    const postUrl = data.querySelector('link');
    const listGroupItemLi = document.createElement('li');
    const aElem = document.createElement('a');
    const itemButton = document.createElement('button');

    listGroupItemLi.classList.add('list-group-item', 'd-flex', 'justify-content-between', 'align-items-start', 'border-0', 'border-end-0');
    listGroupItemLi.setAttribute('id', `${id}`);
    aElem.classList.add('fw-bold');
    itemButton.classList.add('btn', 'btn-outline-primary', 'btn-sm', 'preview');

    itemButton.setAttribute('type', 'button');
    itemButton.setAttribute('id', `${id}`);
    itemButton.setAttribute('data-bs-toggle', 'modal');
    itemButton.setAttribute('data-bs-target', '#rssModal');
    aElem.setAttribute('href', postUrl.textContent);

    itemButton.textContent = 'Просмотр';
    aElem.textContent = itemTitle.textContent;
    listGroupItemLi.append(aElem);
    listGroupItemLi.append(itemButton);
    listGroupUlPosts.append(listGroupItemLi);
  });
}

const initWatchedState = (i18nextInstance, state) => onChange(state, (path, value) => {
  switch (path) {
    case 'appStatus':
      setInputFieldStatus(value, state.errorMessage, i18nextInstance);
      break;
    case 'feedsNumber':
      if (state.feedsNumber === 1) {
        createFeedsAndPostsBlock('feeds', i18nextInstance);
        createFeedsAndPostsBlock('posts', i18nextInstance);
      }
      break;
    case 'dataTitle': {
      const title = state.dataTitle.textContent;
      const description = state.dataDescription.textContent;
      const feed = { title, description };
      addFeeds(feed);
      break;
    }
    case 'posts': {
      const { posts } = state;
      addPosts(posts);
      break;
    }
    case 'errorMessage':
      setInputFieldStatus('error', state.errorMessage, i18nextInstance);
      break;
    default:
  }
});

export default initWatchedState;
