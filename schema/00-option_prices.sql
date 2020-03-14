create table option_prices(
  ticker TEXT NOT NULL,
  prices JSON NOT NULL,
  scraped_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
