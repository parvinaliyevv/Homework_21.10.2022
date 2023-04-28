$(() => {
    const puzzle = $("#puzzle");

    let row;
    let column;
    let cellSize;
    let isHidden;
    let hintCount;
    let positions;
    let readyCells;
    let currentLevel;

    reset();
    firstLevel();

    $("#show").click(function () {
        if (readyCells.length == row * column) return;

        if (isHidden) {
            for (let cell of puzzle.children()) {
                let posX = $(cell).attr('id') % column;
                let posY = Math.floor($(cell).attr('id') / column);

                positions.set($(cell).attr('id'), $(cell).position());

                $(cell).animate({ opacity: 0 }, 100, function () {
                    $(this).css({
                        top: `${cellSize * posY}px`,
                        left: `${cellSize * posX}px`,
                        transform: 'rotate(0deg)'
                    })
                        .animate({ opacity: 1 }, 300);
                });
            }

            $("#hint").prop('disabled', true);
        }
        else {
            for (let cell of puzzle.children()) {
                let id = $(cell).attr('id');
                let position = positions.get(id);

                $(cell).animate({ opacity: 0 }, 100, function () {
                    $(this).css({
                        top: `${position.top}px`,
                        left: `${position.left}px`,
                        transform: 'rotate(0deg)'
                    })
                        .animate({ opacity: 1 }, 300);
                });
            }

            $("#hint").prop('disabled', false);
        }

        isHidden = !isHidden;
        $("#show").text(isHidden ? 'show' : 'hide');
    });

    $("#hint").click(function () {

        if (hintCount == 0) return;

        let hint = true;
        let tryCount = 0;

        $("#show").prop('disabled', true);
        $("#hint").prop('disabled', true);

        while (hint) {
            let index = rand(0, row * column);
            tryCount++;

            if (readyCells.indexOf(index) == -1 || tryCount > 100) {
                for (let cell of puzzle.children()) {
                    let id = parseInt($(cell).attr('id'));

                    if (id == index || tryCount > 100 && readyCells.indexOf(id) == -1) {
                        let posX = id % column;
                        let posY = Math.floor(id / column);

                        $(cell).animate({
                            top: `${cellSize * posY}px`,
                            left: `${cellSize * posX}px`
                        }, function () {
                            $(this).css({
                                transform: 'rotate(0deg)',
                                boxShadow: 'none'
                            });

                            readyCells.push(id);
                            if (readyCells.length == row * column) win();

                            $("#count").html(hintCount);

                            $("#show").prop('disabled', false);
                            $("#hint").prop('disabled', false);
                        });

                        hintCount--;
                        hint = false;

                        break;
                    }
                }
            }
        }
    });

    $("#retry").click(function() {
        reset();

        if (currentLevel == 1) firstLevel();
        else if (currentLevel == 2) secondLevel();
    })

    function childrenInitialize() {
        puzzle.children().draggable({
            start: function () {
                puzzle.children().css('z-index', 0);

                let index = readyCells.indexOf(parseInt($(this).attr('id')));
                if (index != -1) readyCells.splice(index, 1);

                $(this).css({
                    transform: 'rotate(0deg)',
                    boxShadow: '0 0 5px #333',
                    zIndex: 1
                })
            },
            drag: function () {

            },
            stop: function () {
                let cellPosition = $(this).position();

                if (cellPosition.left > - cellSize / 2 && cellPosition.left + cellSize / 2 < puzzle.width() &&
                    cellPosition.top > - cellSize / 2 && cellPosition.top + cellSize / 2 < puzzle.height()) {
                    $(this).css({
                        top: `${cellSize * Math.round($(this).position().top / cellSize)}px`,
                        left: `${cellSize * Math.round($(this).position().left / cellSize)}px`,
                        boxShadow: 'none'
                    });

                    let sourceX = Math.round($(this).position().left / cellSize);
                    let destinationX = $(this).attr('id') % column;

                    let sourceY = Math.round($(this).position().top / cellSize);
                    let destinationY = Math.floor($(this).attr('id') / column);

                    if (sourceX == destinationX && sourceY == destinationY) {
                        let index = readyCells.indexOf(parseInt($(this).attr('id')));
                        if (index == -1) readyCells.push(parseInt($(this).attr('id')));
                    }

                    if (readyCells.length == row * column) win();
                }
            }
        });

        puzzle.children().css({
            height: `${cellSize}px`,
            width: `${cellSize}px`,
        });
    }

    function firstLevel() {
        cellSize = 100;
        row = 400 / cellSize;
        column = 600 / cellSize;
        currentLevel = 1;
        hintCount = 30;

        $("#count").html(hintCount);

        for (let i = 0; i < row; i++) {
            for (let j = 0; j < column; j++) {
                puzzle.append(`<div id='${i * column + j}'></div>`);
                puzzle.children().last().css({
                    top: rand(puzzle.position().top + puzzle.height() - cellSize / 2, $(window).height() - cellSize - 150) + 'px',
                    left: rand(-puzzle.position().left + cellSize, puzzle.width() + cellSize * 2) + 'px',
                    transform: `rotate(${rand(-45, 45)}deg)`,
                    background: `url(assets/banan.jpg) ${-cellSize * j}px ${-cellSize * i}px`
                });
            }
        }

        childrenInitialize();
    }

    function secondLevel() {
        cellSize = 50;
        row = 400 / cellSize;
        column = 600 / cellSize;
        currentLevel = 2;
        hintCount = 8;

        $("#count").html(hintCount);

        for (let i = 0; i < row; i++) {
            for (let j = 0; j < column; j++) {
                puzzle.append(`<div id='${i * column + j}'></div>`);
                puzzle.children().last().css({
                    top: rand(puzzle.position().top + puzzle.height() - cellSize / 2, $(window).height() - cellSize - 150) + 'px',
                    left: rand(-puzzle.position().left + cellSize, puzzle.width() + cellSize * 2) + 'px',
                    transform: `rotate(${rand(-45, 45)}deg)`,
                    background: `url(assets/metro.jpg) ${-cellSize * j}px ${-cellSize * i}px`
                });
            }
        }

        childrenInitialize();
    }

    function reset() {
        isHidden = true;
        positions = new Map();
        readyCells = [];

        puzzle.empty();
    }

    function win() {
        puzzle.append("<div></div>");

        puzzle.children().last().css({
            height: '100%',
            width: '100%',
            background: 'black',
            color: 'white',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 2
        });

        if (currentLevel == 1) {
            puzzle.children().last().html("<button id='next'>Next Level</button>");
            $("#next").css({
                padding: '10px',
                width: '150px'
            })
                .click(function () {
                    reset();
                    secondLevel();
                });
        }
        else if (currentLevel == 2) {
            puzzle.children().last().html("<h1>Winner Winner\nChicken Dinner!</h1>");
            $("#winner").css({
                font: '34px Comic Sans MS'
            });
        }
    }

    function rand(min, max) { return Math.floor(Math.random() * (max - min)) + min; }
});
