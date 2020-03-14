const pg = require('pg')
const express = require('express')
const fetch = require('node-fetch')
const SQL = require('sql-template-strings')
const cron = require('node-cron')

const port = process.env.PORT || 3000

const databaseQuery = async (sqlStatement) => {
  const client = new pg.Client({
    connectionString: process.env.DATABASE_URL,
    ssl: true
  })
  await client.connect()
  try {
    const { rows } = await client.query(sqlStatement.text, sqlStatement.values)
    return rows
  } catch (err) {
    throw err
  } finally {
    await client.end()
  }
}

const scrapeTickerPrices = async (ticker) => {
  const response = await fetch(`https://www.optionsprofitcalculator.com/ajax/getOptions?stock=${ticker}&reqId=1`)
  const responseBody = await response.json()
  await databaseQuery(SQL`INSERT into option_prices(ticker, prices, scraped_at) VALUES (${ticker}, ${JSON.stringify(responseBody)}, NOW())`)
  return responseBody
}

const getTickerPrices = async (tickers) => {
  return databaseQuery(SQL`SELECT ticker, prices, scraped_at FROM option_prices WHERE ticker IN (${tickers})`)
}

const app = express()
app.get('/tickers/:ticker/prices/scrape', (req, res) => {
  scrapeTickerPrices(req.params.ticker)
  .then((prices) => res.send(prices))
  .catch((err) => res.status(500).send({ error: err.stack }))
})
app.get('/tickers/:ticker/prices', (req, res) => {
  getTickerPrices(req.params.ticker)
  .then((prices) => res.send(prices))
  .catch((err) => res.status(500).send({ error: err.stack }))
})
app.listen(port, () => console.log('Listening...'))

cron.schedule('* 4-16 * * 1-5', () => {
  fetch(`http://localhost:${port}/tickers/SPY/prices/scrape`)
})
