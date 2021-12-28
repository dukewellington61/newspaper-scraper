const uniqBy = require("lodash.uniqby");
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

const allArticles = [];

newspapers.forEach((newspaper) => {
  axios
    .get(newspaper.address)
    .then((response) => {
      const html = response.data;
      const $ = cheerio.load(html);

      $("a", html).each(function () {
        const title = $(this).text();
        const url = $(this).attr("href") || "";

        // if (url.includes("covid") && url.includes("germany")) {
        if (url.includes("africa")) {
          allArticles.push({
            title,
            url: newspaper.base + url,
            soure: newspaper.name,
          });
        }

        // allArticles.push({
        //   title,
        //   url: url,
        //   soure: newspaper.name,
        // });

        if (
          url.includes(newspaper.address) &&
          (url.match(/\/(\w+)/gi) || []).length < 4 &&
          url.match("^[a-zA-Z0-9äöüÄÖÜ///ig.:-]*$")
        ) {
          console.log(url);
          // console.log((url.match(/\/(\w+)/gi) || []).length);
          axios
            .get(url)
            .then((resp) => {
              const resp_html = resp.data;
              const resp_$ = cheerio.load(resp_html);

              resp_$("a", html).each(function () {
                const resp_title = $(this).text();
                const resp_url = $(this).attr("href") || "";

                if (
                  resp_url.includes("africa")
                  //  &&
                  // resp_url.includes("germany")
                ) {
                  allArticles.push({
                    resp_title,
                    url: newspaper.base + resp_url,
                    soure: newspaper.name,
                  });
                }
              });
            })
            .catch((err) => {
              console.log(err.message);
            });
        }
      });
    })
    .catch((err) => console.log(err.message));
});

app.get("/test", (req, res) => {
  res.json(uniqBy(allArticles, "url"));
  // console.log(allArticles);
  res.json(allArticles);
});

app.listen(PORT, () => console.log(`server running on PORT ${PORT}`));
