const parse = (stringContainingXMLSource) => {
  const parser = new DOMParser();
  const doc = parser.parseFromString(stringContainingXMLSource, 'application/xml');
  const parseError = doc.querySelector('parsererror');
  if (parseError !== null) {
    const errorText = parseError.querySelector('div').textContent;
    const error = new Error(`${errorText}`);
    error.isParsingError = true;
    throw error;
  }
  const channel = doc.querySelector('channel');
  const posts = Array.from(doc.querySelectorAll('item'))
    .map((item) => {
      const postTitle = item.querySelector('title').textContent;
      const postDescription = item.querySelector('description').textContent;
      const pubDate = item.querySelector('pubDate').textContent;
      const link = item.querySelector('link').textContent;
      const post = {
        postTitle,
        postDescription,
        pubDate,
        link,
      };
      return post;
    });
  const result = {
    title: channel.querySelector('title'),
    description: channel.querySelector('description'),
    posts,
  };
  return result;
};

export default parse;
