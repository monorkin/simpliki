# Simpliki

Simpliki is an app for practicing diaphragm breathing.

But, more importantly, Simpliki is an example app that shows
what can be done with modern browser APIs and vanilla Rails.

[Here's a full write up](https://stanko.io/building-simpl-77CAzym51p5a)

## Setup

To run Simpliki locally you have to have Ruby 3.4 or later installed.
Then from the root directory of the project run

```
bundle
bin/rails db:create db:migrate db:fixtures:load
bin/dev
```

Now you should have Simpliki running on [http://localhost:3000](http://localhost:3000).
