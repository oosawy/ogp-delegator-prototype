const express = require('express')

const app = express()

app.get('/ogp', (req, res) => {
  res.send(`<meta property="og:type" content="website">
    <meta property="og:title" content="Page Title">
    <meta property="og:description" content="This is an example site">
    <meta property="og:site_name" content="An Example site">
    <meta property="og:url" content="${req.query.url}">
    <meta property="og:image" content="https://via.placeholder.com/600x400.png?text=OGP%20Image">`)
})

app.listen(9002)
