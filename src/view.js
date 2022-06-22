import onChange from 'on-change';
import _ from 'lodash';

const listGroupUlPosts = document.querySelector('.ul-posts');
const listGroupUlFeeds = document.querySelector('.ul-feeds');

const domElements = {
  feedsBlock: document.querySelector('.feeds'),
  postsBlock: document.querySelector('.posts'),
  errorField: document.querySelector('.feedback'),
  textField: document.querySelector('.form-control'),
  readAllButton: document.querySelector('.read-all'),
  modalTitle: document.querySelector('.modal-title'),
  modalDescription: document.querySelector('.modal-description'),
};

function setInputFieldStatus(status, errorMessage, i18nextInstance) {
  switch (status) {
    case 'idle':
      domElements.textField.classList.remove('border', 'border-2', 'border-danger');
      domElements.errorField.textContent = '';
      domElements.textField.removeAttribute('readonly');
      document.querySelector('.add').disabled = false;
      break;
    case 'submitting':
      domElements.textField.setAttribute('readonly', true);
      document.querySelector('.add').disabled = true;
      domElements.textField.classList.remove('border', 'border-2', 'border-danger');
      domElements.errorField.textContent = '';
      break;
    case 'success':
      domElements.textField.removeAttribute('readonly');
      document.querySelector('.add').disabled = false;
      domElements.textField.classList.remove('border', 'border-2', 'border-danger');
      domElements.textField.value = '';
      domElements.errorField.classList.remove('text-danger');
      domElements.errorField.classList.add('text-success');
      domElements.errorField.textContent = i18nextInstance.t('feedback.success');
      break;
    case 'error':
      domElements.textField.removeAttribute('readonly');
      document.querySelector('.add').disabled = false;
      domElements.errorField.classList.remove('text-success');
      domElements.errorField.classList.add('text-danger');
      domElements.textField.classList.add('border', 'border-3', 'border-danger');
      domElements.errorField.textContent = errorMessage;
      break;
    default:
  }
}

function createFeedsAndPostsBlock(arg, i18nextInstance) {
  const cardBodyDivPosts = document.querySelector('.card-body-posts');
  const cardBodyDivFeeds = document.querySelector('.card-body-feeds');
  if (arg === 'feeds') {
    const cardTitleHeaderFeeds = document.createElement('h2');
    cardBodyDivFeeds.append(cardTitleHeaderFeeds);
    cardTitleHeaderFeeds.classList.add('card-title', 'h4', 'ms-3');
    cardTitleHeaderFeeds.textContent = i18nextInstance.t('feeds.feedsHeader');
  }
  if (arg === 'posts') {
    const cardTitleHeaderPosts = document.createElement('h2');
    cardBodyDivPosts.append(cardTitleHeaderPosts);
    cardTitleHeaderPosts.classList.add('card-title', 'h4', 'ms-3');
    cardTitleHeaderPosts.textContent = i18nextInstance.t('posts.postsHeader');
  }
}

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

function addPosts(items, state) {
  listGroupUlPosts.innerHTML = '';
  items.forEach(({ data, id }) => {
    const itemTitle = data.querySelector('title');
    const postUrl = data.querySelector('link');
    const listGroupItemLi = document.createElement('li');
    const aElem = document.createElement('a');
    const itemButton = document.createElement('button');
    listGroupItemLi.classList.add('list-group-item', 'd-flex', 'justify-content-between', 'align-items-start', 'border-0', 'border-end-0');
    listGroupItemLi.setAttribute('id', `${id}`);
    if (state.watchedPosts.includes(id)) {
      aElem.classList.add('fw-normal');
    } else {
      aElem.classList.add('fw-bold');
    }
    itemButton.classList.add('btn', 'btn-outline-primary', 'btn-sm', 'preview');
    itemButton.setAttribute('data-id', `${id}`);
    itemButton.setAttribute('type', 'button');
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
    case 'form.state':
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
      addPosts(posts, state);
      break;
    }
    case 'errorMessage':
      setInputFieldStatus('error', state.errorMessage, i18nextInstance);
      break;
    case 'openedModalId':
      // eslint-disable-next-line no-case-declarations
      const openedPost = document.getElementById(`${state.openedModalId}`);
      domElements.readAllButton.setAttribute('href', `${openedPost.firstChild.href}`);
      domElements.modalTitle.textContent = openedPost.firstChild.textContent;
      domElements.modalDescription.textContent = state.posts[_.findIndex(state.posts, (post) => post.id === state.openedModalId)].data.querySelector('description').textContent;
      openedPost.firstChild.classList.remove('fw-bold');
      openedPost.firstChild.classList.add('fw-normal');
      break;
    default:
  }
});

export default initWatchedState;
