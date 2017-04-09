/**
 * http://usejsdoc.org/
 */
var a = {
    'boardGames': [
        {
            id: 'saboteur', showLabel: 'Saboteur',
            img: 'src/img/saboteur/saboteur_pre.jpg',
        },
        {
            id: 'game1', showLabel: 'Saboteur',
            img: 'src/img/saboteur/saboteur_pre.jpg',
        }],
    'gameType1': [
        {
            id: 'ass', showLabel: 'Saboteur',
            img: 'src/img/saboteur/saboteur_pre.jpg',
        },
        {
            id: 'xcc', showLabel: 'Saboteur',
            img: 'src/img/saboteur/saboteur_pre.jpg',
        }]
}
var gameConst = {
    'saboteur': {
        min: 2, max: 10, entry: 'dbSaboteur'
    }
}
module.exports = {
    allGames: a,
    gameConst: gameConst
};