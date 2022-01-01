const uniqBy = require("lodash.uniqby");
const isString = require("lodash.isstring");
const PORT = process.env.PORT || 8000;
const express = require("express");
const axios = require("axios");
const cheerio = require("cheerio");

const app = express();

const newspapers = [
  {
    name: "thetimes",
    address: "https://www.thetimes.co.uk/",
    base: "https://www.thetimes.co.uk/",
  },
  {
    name: "guardian",
    address: "https://www.theguardian.com",
    base: "",
  },
  {
    name: "telegraph",
    address: "https://www.telegraph.co.uk",
    base: "https://www.telegraph.co.uk",
  },
  {
    name: "aljazeera",
    address: "https://www.aljazeera.com",
  },
  {
    name: "nytimes",
    address: "https://www.nytimes.com",
    base: "",
  },
  {
    name: "bbc",
    address: "https://www.bbc.com/",
    base: "https://www.bbc.com/",
  },
];

const articles = [];

// newspapers.forEach((newspaper) => {
//   axios.get(newspaper.address).then((response) => {
//     const html = response.data;
//     const $ = cheerio.load(html);

//     var regex = new RegExp('^.*(crypto).*$');

//     // $(
//     //   'a:contains("crypto"):contains("currency"),a:contains("cryptocurrency")',
//     //   html
//     // )
//     $('a *')
//       .filter(function () {
//         const text = $(this).text() || $(this).attr('href');
//         if (text) {
//           const reg = new RegExp('^[a-zA-Z0-9]*$');
//           let newText = text.replace(/\s+/g, '');
//           newText = newText.split('').filter((el) => reg.test(el));
//           console.log(newText.join(''));
//           return regex.test(newText.join(''));
//         }
//       })
//       .each(function () {
//         const title = $(this).text();
//         const url = $(this).attr('href');

//         articles.push({
//           title,
//           url: newspaper.base + url,
//           soure: newspaper.name,
//         });
//       });
//   });
// });

// app.get('/', (req, res) => {
//   res.json('home');
// });

// app.get('/news', (req, res) => {
//   res.json(articles);
// });

// app.get('/news/:newspaperId', (req, res) => {
//   const newspaperId = req.params.newspaperId;

//   const newspaperAddress = newspapers.filter(
//     (newspaper) => newspaper.name === newspaperId
//   )[0].address;

//   const newspaperBase = newspapers.filter(
//     (newspaper) => newspaper.name === newspaperId
//   )[0].base;

//   axios
//     .get(newspaperAddress)
//     .then((response) => {
//       const html = response.data;
//       const $ = cheerio.load(html);
//       const specificArticles = [];

//       $('a:contains("climate")', html).each(function () {
//         const title = $(this).text();
//         const url = $(this).attr('href');

//         specificArticles.push({
//           title,
//           url: newspaperBase + url,
//           soure: newspaperId,
//         });
//       });
//       res.json(specificArticles);
//     })
//     .catch((err) => console.log(err.message));
// });

// function validURL(str) {
//   var pattern = new RegExp(
//     '^(https?:\\/\\/)?' + // protocol
//       '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|' + // domain name
//       '((\\d{1,3}\\.){3}\\d{1,3}))' + // OR ip (v4) address
//       '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*' + // port and path
//       '(\\?[;&a-z\\d%_.~+=-]*)?' + // query string
//       '(\\#[-a-z\\d_]*)?$',
//     'i'
//   ); // fragment locator
//   return !!pattern.test(str);
// }

// const searchTerm = "covid";

const searchArticles = async (searchTerm) => {
  let searchTermRegex;

  if (isString(searchTerm)) {
    searchTermRegex = new RegExp(`(?=.*${searchTerm})`);
  }

  if (Array.isArray(searchTerm)) {
    searchTermRegex = new RegExp(
      searchTerm.map((term) => `(?=.*${term})`).join("")
    );
  }

  // console.log(searchTermRegex);
  try {
    const articles = await Promise.all(
      newspapers.map(async (newspaper) => {
        const response = await axios.get(newspaper.address);

        const html = response.data;
        const $ = cheerio.load(html);

        const returnArr = [];

        $("a", html).each(async function () {
          const title = $(this).text();
          const url = $(this).attr("href") || "";

          if (searchTermRegex.test(url)) {
            returnArr.push({
              title,
              url: newspaper.base + url,
              soure: newspaper.name,
            });
          }

          if (
            url.includes(newspaper.address) &&
            // (url.match(/\/(\w+)/gi) || []).length < 100 &&
            url.match("^[a-zA-Z0-9äöüÄÖÜ///ig.:-]*$")
          ) {
            console.log(url);
            try {
              const resp = await axios.get(url);

              const resp_html = resp.data;
              const resp_$ = cheerio.load(resp_html);

              resp_$("a", html).each(function () {
                const resp_title = $(this).text();
                const resp_url = $(this).attr("href") || "";

                if (searchTermRegex.test(resp_url)) {
                  returnArr.push({
                    resp_title,
                    url: newspaper.base + resp_url,
                    soure: newspaper.name,
                  });
                }
              });
            } catch (err) {
              console.log(err.message);
            }
          }
        });
        console.log(newspaper.name + " " + searchTerm + " ...done");
        return returnArr;
      })
    );
    return articles;
  } catch (error) {
    // const { response } = error;
    // const { req, ...errorObject } = response; // take everything but 'request'
    console.log(error);
  }
};

app.get("/test", async (req, res) => {
  const { search } = req.query;
  // console.log(search);

  const returnArray = await searchArticles(search);
  // console.log("returnArray");
  // console.log(returnArray);
  // res.json(uniqBy(returnArray, "url"));
  // console.log(allArticles);
  res.json(returnArray);
});

app.listen(PORT, () => console.log(`server running on PORT ${PORT}`));
