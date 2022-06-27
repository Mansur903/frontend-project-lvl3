import * as yup from 'yup';

const yupLocale = () => yup.setLocale({
  string: {
    url: 'invalidUrl',
  },
  mixed: {
    notOneOf: 'rssExists',
  },
});

export default yupLocale;
