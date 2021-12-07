const axios = require('axios');

function getData(url) {
  return axios.get(`https://hexlet-allorigins.herokuapp.com/get?disableCache=true&url=${encodeURIComponent(`${url}`)}`)
    .then((response) => {
      if (response.status === 200) return response.data;
      throw new Error('Network response was not ok.');
    })
    .catch((e) => console.log(e));
}

export default getData;
