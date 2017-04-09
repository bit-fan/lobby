var deck = [
    //link: R,U,L,D
    //pass:[hor,vertial,LU,RU,RD,LD]

    //func cards
    {
        cardType:'func',
        cardId: 'P_',
        img: 'deck/tool_P.jpg',
        count: 3,
    },
    {
        cardType:'func',
        cardId: 'L_',
        img: 'deck/tool_L.jpg',
        count: 3,
    },
    {
        cardType:'func',
        cardId: 'W_',
        img: 'deck/tool_W.jpg',
        count: 3,
    },
    {
        cardType:'func',
        cardId: 'P',
        img: 'deck/toolP.jpg',
        count: 2,
    },
    {
        cardType:'func',
        cardId: 'L',
        img: 'deck/toolL.jpg',
        count: 2,
    },
    {
        cardType:'func',
        cardId: 'W',
        img: 'deck/toolW.jpg',
        count: 2,
    },
    {
        cardType:'func',
        cardId: 'PL',
        img: 'deck/toolPL.jpg',
        count: 1,
    },
    {
        cardType:'func',
        cardId: 'LW',
        img: 'deck/toolLW.jpg',
        count: 1,
    },
    {
        cardType:'func',
        cardId: 'PW',
        img: 'deck/toolPW.jpg',
        count: 1,
    },
    {
        cardType:'func',
        cardId: 'Reveal',
        img: 'deck/reveal.jpg',
        count: 6,
    },
    {
        cardType:'func',
        cardId: 'RockFall',
        img: 'deck/rockFall.jpg',
        count: 3,
    },

    //map cards
    {
        cardType:'map',
        cardId: 'm10a',
        img: 'deck/map10a.jpg',
        link: [1, 0, 0, 0],
        pass: [0, 0, 0, 0, 0, 0],
        count: 1
    },
    {
        cardType:'map',
        cardId: 'm10b',
        img: 'deck/map10b.jpg',
        link: [0, 1, 0, 0],
        pass: [0, 0, 0, 0, 0, 0],
        count: 1
    },
    {
        cardType:'map',
        cardId: 'm20a',
        img: 'deck/map20a.jpg',
        link: [1, 0, 1, 0],
        pass: [0, 0, 0, 0, 0, 0],
        count: 1
    },
    {
        cardType:'map',
        cardId: 'm20b',
        img: 'deck/map20b.jpg',
        link: [0, 1, 0, 1],
        pass: [0, 0, 0, 0, 0, 0],
        count: 1
    },
    {
        cardType:'map',
        cardId: 'm20c',
        img: 'deck/map20c.jpg',
        link: [1, 0, 0, 1],
        pass: [0, 0, 0, 0, 0, 0],
        count: 1
    },
    {
        cardType:'map',
        cardId: 'm20d',
        img: 'deck/map20d.jpg',
        link: [0, 0, 1, 1],
        pass: [0, 0, 0, 0, 0, 0],
        count: 1
    },
    {
        cardType:'map',
        cardId: 'm21a',
        img: 'deck/map21a.jpg',
        link: [1, 0, 1, 0],
        pass: [1, 0, 0, 0, 0, 0],
        count: 3
    },
    {
        cardType:'map',
        cardId: 'm21b',
        img: 'deck/map21b.jpg',
        link: [0, 1, 0, 1],
        pass: [0, 1, 0, 0, 0, 0],
        count: 4
    },
    {
        cardType:'map',
        cardId: 'm21c',
        img: 'deck/map21c.jpg',
        link: [1, 0, 0, 1],
        pass: [0, 0, 0, 0, 1, 0],
        count: 4
    },
    {
        cardType:'map',
        cardId: 'm21d',
        img: 'deck/map21d.jpg',
        link: [0, 0, 1, 1],
        pass: [0, 0, 0, 0, 0, 1],
        count: 5
    },
    {
        cardType:'map',
        cardId: 'm30a',
        img: 'deck/map30a.jpg',
        link: [1, 1, 1, 0],
        pass: [0, 0, 0, 0, 0, 0],
        count: 1
    },
    {
        cardType:'map',
        cardId: 'm30b',
        img: 'deck/map30b.jpg',
        link: [1, 1, 0, 1],
        pass: [0, 0, 0, 0, 0, 0],
        count: 1
    },
    {
        cardType:'map',
        cardId: 'm33a',
        img: 'deck/map33a.jpg',
        link: [1, 0, 1, 1],
        pass: [1, 0, 0, 0, 1, 1],
        count: 5
    },
    {
        cardType:'map',
        cardId: 'm33b',
        img: 'deck/map33b.jpg',
        link: [0, 1, 1, 1],
        pass: [0, 1, 1, 0, 0, 1],
        count: 5
    },
    {
        cardType:'map',
        cardId: 'm40',
        img: 'deck/map40.jpg',
        link: [1, 1, 1, 1],
        pass: [0, 0, 0, 0, 0, 0],
        count: 1
    },
    {
        cardType:'map',
        cardId: 'm46',
        img: 'deck/map46.jpg',
        link: [1, 1, 1, 1],
        pass: [1, 1, 1, 1, 1, 1],
        count: 5
    },
]
var misc = [
    {
        cardType:'start',
        cardId: 'start',
        img: 'startgoal/start.jpg'
    },
    {
        cardType:'goal',
        cardId: 'goal1',
        img: 'startgoal/goal1.jpg',
        link: [1, 0, 0, 1],
        pass: [0, 0, 0, 0, 1, 0]
    },
    {
        cardType:'goal',
        cardId: 'goal2',
        img: 'startgoal/goal2.jpg',
        link: [0, 0, 1, 1],
        pass: [0, 0, 0, 0, 0, 1]
    },
    {
        cardType:'goal',
        cardId: 'goal',
        img: 'startgoal/goal.jpg'
    }
]
var other = [
    {
        cardType:'ID',
        cardId: 'idBack',
        img: 'iden/idBack.jpg'
    },
    {
        cardType:'ID',
        cardId: 'idDigger',
        img: 'iden/idDigger.jpg',
    },
    {
        cardType:'ID',
        cardId: 'idSab',
        img: 'iden/idSab.jpg',
    },
    {
        cardType:'back',
        cardId: 'goalBack',
        img: 'startgoal/goalBack.jpg',
    },
    {
        cardType:'statusIcon',
        cardId: 'lanternIcon',
        img: 'other/lantern.svg'
    },
    {
        cardType:'statusIcon',
        cardId: 'pickIcon',
        img: 'other/pick.svg',
    },
    {
        cardType:'statusIcon',
        cardId: 'wagonIcon',
        img: 'other/wagon.svg',
    },
]

var numSab = {
    2: 1,
    3: 1,
    4: 1,
    5: 2,
    6: 2,
    7: 3,
    8: 3,
    9: 3,
    10: 4
}
var maxHand = {
    2: 7,
    3: 6,
    4: 6,
    5: 6,
    6: 5,
    7: 5,
    8: 4,
    9: 4,
    10: 4,
}
module.exports = {
    deck: deck,
    misc: misc,
    numSab: numSab,
    maxHand: maxHand,
    other: other
};