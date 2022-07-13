import _ from 'lodash';

const parse = (stringContainingXMLSource) => {
  const parser = new DOMParser();
  const doc = parser.parseFromString(stringContainingXMLSource, 'application/xml');
  const parseError = doc.querySelector('parsererror');
  if (parseError !== null) {
    const errorText = parseError.textContent;
    const error = new Error(errorText);
    error.isParsingError = true;
    throw error;
  }
  const channel = doc.querySelector('channel');
  const postsElements = doc.querySelectorAll('item');

  const posts = _.map(postsElements, (item) => {
    const postTitleElement = item.querySelector('title');
    const postTitle = postTitleElement.textContent;
    const postDescriptionElement = item.querySelector('description');
    const postDescription = postDescriptionElement.textContent;
    const pubDateElement = item.querySelector('pubDate');
    const pubDate = pubDateElement.textContent;
    const linkElement = item.querySelector('link');
    const link = linkElement.textContent;
    const post = {
      postTitle,
      postDescription,
      pubDate,
      link,
    };
    return post;
  });

  const title = channel.querySelector('title').textContent;
  const description = channel.querySelector('description').textContent;

  const result = {
    title,
    description,
    posts,
  };
  return result;
};

export default parse;
