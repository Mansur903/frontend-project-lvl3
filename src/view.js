import onChange from 'on-change';
import _ from 'lodash';

function setInputFieldStatus(status, errorType, i18nextInstance, dom) {
  const domElements = dom;
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
      domElements.errorField.textContent = i18nextInstance.t(`feedback.${errorType}`);
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

function addFeed(feed, dom) {
  const domElements = dom;

  const listGroupItemLi = document.createElement('li');
  const titleH3 = document.createElement('h3');
  const feedDescription = document.createElement('p');

  titleH3.textContent = feed.title.textContent;
  feedDescription.textContent = feed.description.textContent;
  titleH3.classList.add('h6', 'm-0');
  feedDescription.classList.add('m-0', 'text-black-50');
  listGroupItemLi.classList.add('list-group-item', 'border-0', 'border-end-0');
  listGroupItemLi.append(titleH3);
  listGroupItemLi.append(feedDescription);
  domElements.listGroupUlFeeds.append(listGroupItemLi);
}

function addPosts(posts, state, dom) {
  const domElements = dom;
  domElements.listGroupUlPosts.innerHTML = '';
  posts.forEach(({ postTitle, modalLink, id }) => {
    const listGroupItemLi = document.createElement('li');
    const aElem = document.createElement('a');
    const itemButton = document.createElement('button');
    listGroupItemLi.classList.add('list-group-item', 'd-flex',
      'justify-content-between', 'align-items-start', 'border-0', 'border-end-0');
    listGroupItemLi.setAttribute('id', `${id}`);
    if (state.watchedPosts.has(id)) {
      aElem.classList.add('fw-normal');
    } else {
      aElem.classList.add('fw-bold');
    }
    itemButton.classList.add('btn', 'btn-outline-primary', 'btn-sm', 'preview');
    itemButton.setAttribute('data-id', `${id}`);
    itemButton.setAttribute('type', 'button');
    itemButton.setAttribute('data-bs-toggle', 'modal');
    itemButton.setAttribute('data-bs-target', '#rssModal');
    aElem.setAttribute('href', modalLink);
    itemButton.textContent = 'Просмотр';
    aElem.textContent = postTitle;
    listGroupItemLi.append(aElem);
    listGroupItemLi.append(itemButton);
    domElements.listGroupUlPosts.append(listGroupItemLi);
  });
}

const initWatchedState = (i18nextInstance, state, dom) => onChange(state, (path, value) => {
  const domElements = dom;
  switch (path) {
    case 'form.state':
      setInputFieldStatus(value, state.form.errorType, i18nextInstance, domElements);
      break;
    case 'form.errorType':
      setInputFieldStatus('error', state.form.errorType, i18nextInstance, domElements);
      break;
    case 'feedsNumber':
      if (state.feedsNumber === 1) {
        createFeedsAndPostsBlock('feeds', i18nextInstance, domElements);
        createFeedsAndPostsBlock('posts', i18nextInstance, domElements);
      }
      break;
    case 'feeds': {
      if (state.feeds.length === 1) {
        createFeedsAndPostsBlock('feeds', i18nextInstance, domElements);
        createFeedsAndPostsBlock('posts', i18nextInstance, domElements);
      }
      const newFeed = state.feeds[state.feeds.length - 1];
      addFeed(newFeed, domElements);
      break;
    }
    case 'posts': {
      const { posts } = state;
      addPosts(posts, state, domElements);
      break;
    }
    case 'modal.postId':
      // eslint-disable-next-line no-case-declarations
      const openedPost = document.getElementById(`${state.modal.postId}`);
      domElements.readAllButton.setAttribute('href', `${openedPost.firstChild.href}`);
      domElements.modalTitle.textContent = openedPost.firstChild.textContent;
      domElements.modalDescription.textContent = state
        .posts[_.findIndex(state.posts, (post) => post.id === state.modal.postId)]
        .postDescription;
      openedPost.firstChild.classList.remove('fw-bold');
      openedPost.firstChild.classList.add('fw-normal');
      break;
    default:
  }
});

export default initWatchedState;
