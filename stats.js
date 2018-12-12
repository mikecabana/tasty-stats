let Parser = require('rss-parser');
let parseMs = require('parse-ms');
let moment = require('moment');
let parser = new Parser();

module.exports = async () => {

    let feed;
    try {
        feed = await parser.parseURL('https://feed.syntax.fm/rss');
    } catch (error) {
        console.error(error);
    }

    const parsedItems = feed.items
        .map(item => {
            const durationString = item.itunes.duration || '00:00:00';
            return {
                title: item.title,
                durationString,
                duration: durationString.split(':').reverse().reduce((aggregate, item, index) => aggregate + (item * Math.pow(60, index)))
            }
        });

    const combinedDuration = parsedItems.map(i => parseInt(i.duration, 10)).reduce((aggregate, item) => aggregate + item) / 60;
    const averageDuration = (parsedItems.map(i => parseInt(i.duration, 10)).reduce((aggregate, item) => aggregate + item) / 60) / parsedItems.length;

    return {
        timeStats: {
            days: moment.duration(combinedDuration).asDays().toFixed(2),
            hours: moment.duration(combinedDuration).asHours().toFixed(2),
            minutes: moment.duration(combinedDuration).asMinutes().toFixed(2),
            seconds: moment.duration(combinedDuration).asSeconds().toFixed(2),
            breakdown: parseMs(combinedDuration),
            averageBreakdown: parseMs(averageDuration)
        },
        podcastData: {
            count: parsedItems.length,
            items: parsedItems
        }
    };
};