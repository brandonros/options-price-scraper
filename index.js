const pg = require('pg')
const cron = require('cron')
const fetch = require('node-fetch')
const SQL = require('sql-template-strings')

cron.schedule('* 4-16 * * 1-5', async () => {
  const client = new pg.Client({
    connectionString: process.env.DATABASE_URL,
    ssl: true
  })
  await client.connect()
  try {
    const tickers = [
      'SPY'
    ]
    for (let i = 0; i < tickers.length; ++i) {
      const ticker = tickers[i]
      const response = await fetch(`https://www.optionsprofitcalculator.com/ajax/getOptions?stock=${ticker}&reqId=1`)
      const responseBody = await response.json()
      const sqlStatement = SQL`INSERT into option_prices(ticker, prices, scraped_at) VALUES (${ticker}, ${JSON.stringify(prices)}, NOW())`
      await client.query(sqlStatement.text, sqlStatement.values)
    }
  } catch (err) {
    throw err
  } finally {
    await client.end()
  }
})
