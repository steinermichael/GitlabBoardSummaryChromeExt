console.log('GitLabBoardSummary load');

// Load from chrome.storage
let groups = [];

let teamMemberNames = [];

let columnsToShow = [];

const COLUMN_NAME_OPEN = 'Open';
const COLUMN_NAME_CLOSED = 'Closed';
const COLUMN_NAME_SPRINT_BACKLOG = 'Sprint Backlog';
const COLUMN_NAME_IN_PROGRESS = 'In Progress';
const COLUMN_NAME_CONTENT_REVIEW = 'Content Review';
const COLUMN_NAME_CODE_REVIEW = 'Code Review';
const COLUMN_NAME_PO_REVIEW = 'PO-Review';
const COLUMN_NAME_CLOSED_THIS_SPRINT = 'Closed this Sprint';

let activeColumns = [
    COLUMN_NAME_SPRINT_BACKLOG,
    COLUMN_NAME_IN_PROGRESS,
    COLUMN_NAME_CONTENT_REVIEW,
    COLUMN_NAME_CODE_REVIEW,
    COLUMN_NAME_PO_REVIEW,
];

function setColumnsToShow() {
    // console.log('setSpaltenToShow');
    // console.log('len', $('.board-title-text').length);

    columnsToShow = [
        COLUMN_NAME_SPRINT_BACKLOG,
        COLUMN_NAME_IN_PROGRESS,
        COLUMN_NAME_CONTENT_REVIEW,
        COLUMN_NAME_CODE_REVIEW,
        COLUMN_NAME_PO_REVIEW,
        COLUMN_NAME_CLOSED_THIS_SPRINT,
    ];

    // $.each($('.board-title-text'), function(idx, boardTitleText) {
    //     let nameCleaned = $(boardTitleText).text().trim();
    //     columnsToShow.push(nameCleaned);
    // });
    // columnsToShow = columnsToShow.filter(n => !spaltenToHide.includes(n))
    // console.log("spaltenToShow finished");
    // console.log(spaltenToShow);
}

function addInitialHeaderForColumn(columnName) {
    console.log('getStorypointsFromColumn', columnName);
    let $columnHeadline;

    //if (columnName == 'Open' || columnName == 'Closed') {
    if (columnName == COLUMN_NAME_OPEN || columnName == COLUMN_NAME_CLOSED) {
        $columnHeadline = $('.board-title-text span[title="' + columnName + '"]');
        console.log('columnName is Open or Closed');
    } else {
        $columnHeadline = $('.board-title-text span.gl-label-text:contains("' + columnName + '")');
    }

    //let $columnHeadline = $('.board-title-text span.gl-label-text:contains("' + columnName + '")');
    console.log($columnHeadline);
    let $boardInner = $columnHeadline.closest('.board-inner');
    console.log($boardInner);
    let secondHeaderArray = [];
    secondHeaderArray.push('<header class="board-header gitlab-board-helper-board-helper" data-column-name="' + columnName + '">');
    secondHeaderArray.push('    <button data-column-name="' + columnName + '" class="gitlab-board-helper-column-activate-button">aktivieren</button>');
    secondHeaderArray.push('</header>');
    $boardInner.find('.board-header').after(secondHeaderArray.join(''));
}

function activateStoryPointsForColumn(columnName) {
    console.log('getStorypointsFromColumn', columnName);
    let $secondHeader = $('.board-header.gitlab-board-helper-board-helper[data-column-name="' + columnName + '"]');

    let secondHeaderArray = [];
    secondHeaderArray.push('<div>&#8721; <span data-column-name="' + columnName + '" class="gitlab-board-helper-column-sum"></span></div>');
    secondHeaderArray.push('<button data-column-name="' + columnName + '" class="gitlab-board-helper-column-refresh-button">aktualisieren</button>');
    $secondHeader.html(secondHeaderArray.join(''));

    // Add listener to trigger update of SP-Sum when Column-SP has been updated
    // Find span that was added before
    $('span.gitlab-board-helper-column-sum[data-column-name="' + columnName + '"]').on('DOMSubtreeModified', function () {
        // console.log('column-sum was updated for columnName ' + $(this).attr('data-column-name'));
        let columnName = $(this).attr('data-column-name');
        updateGlobalSPSum();
        //console.log('column-sum was updated for columnName ' + columnName);
        //console.log($(this));
    });

    getStorypointsFromColumn(columnName);
}

function getShowingAllIssuesInColumn($boardInner) {
    let $nonIssueEntry = $boardInner.find('span[data-issue-id="-1"]');
    if ($nonIssueEntry.length) {
        return ($nonIssueEntry.text() === 'Showing all issues');
    } else {
        return true;
    }
//:contains("Showing all issues")
    //$boardInner.find('span:contains("Showing all issues")').length;
}

function updateGlobalSPSum() {
    let storyPointSum = 0;
    $(activeColumns).each(function(idx, columnName) {
        $('.gitlab-board-helper-column-sum[data-column-name="' + columnName + '"]').each(function (idx, columnSum) {
            storyPointSum += parseInt($(columnSum).html());
        });

        $('#gitlab-board-helper-global-sum-active').html(storyPointSum);
    });
}

function getStorypointsFromColumn(columnName) {

    // TODO: Refactor - Extract as separate function
    let $columnHeadline;
    // $columnHeadline = $('.board-title-text span:contains("' + columnName + '")');

    if (columnName == 'Open' || columnName == 'Closed') {
        $columnHeadline = $('.board-title-text span[title="' + columnName + '"]');
    } else {
        $columnHeadline = $('.board-title-text span.gl-label-text:contains("' + columnName + '")');
    }
    console.log('getStorypointsFromColumn', columnName);

    console.log($columnHeadline);
    let $boardInner = $columnHeadline.closest('.board-inner');

    // TODO: Implement this to automatically update story-point sum on update/loading of more elements
    // $boardInner.on('DOMSubtreeModified', function () {
       //console.log('$boardInner has changed');
       //console.log($(this));
    // });

    console.log($boardInner);

    //const showingAllIssuesInColumn = $boardInner.find('span:contains("Showing all issues")').length;
    const showingAllIssuesInColumn = getShowingAllIssuesInColumn($boardInner);
    if (showingAllIssuesInColumn) {
        let tickets = $boardInner.find('.board-card');
        console.log('tickets', tickets);
        let noStoryPointsFoundCounter = 0;
        // let noStoryPointsFoundTicketnames = [];

        let ticketStoryPointsSum = 0;
        $.each(tickets, function(idx, ticket) {
            //Get membername
            let ticketMemberName = $(ticket).find('img.avatar').attr('alt');
            if (typeof ticketMemberName === 'undefined') {
                // Replace undefined with "nicht zugeordnet"
                ticketMemberName = 'Nicht zugeordnet';
            }  else {
                // Remove "Avatar von" from memberName

                ticketMemberName = ticketMemberName.substr(11).trim();
            }
            // console.log('ticketMemberName:' + ticketMemberName);
            // if (!storyPointsByMember.hasOwnProperty(ticketMemberName)) {
            //     storyPointsByMember[ticketMemberName] = 0;
            // }

            const ticketTitel = $(ticket).find('.board-card-title > a').text().replace(/\s/g, '');
            console.log('ticketTitel', ticketTitel);
            let ticketStoryPoints;
            //console.log('--');
            //console.log($(ticket).find('.board-card-header'));
            let posOfSP = ticketTitel.indexOf('SP)');
            if (posOfSP === -1) {
                // Ticket has no storypoints
                console.log('ticketTitel');
                console.log(ticketTitel);
                console.log($(ticket));
                $(ticket).css('background-color', 'khaki');
                noStoryPointsFoundCounter++;
                // noStoryPointsFoundTicketnames.push(ticketTitel);
            } else {
                let charsBeforeSP = ticketTitel.substr(posOfSP - 2, 2);
                //console.log({charsBeforeSP});
                // Get Storypoints
                if (charsBeforeSP[0] == '(') {
                    ticketStoryPoints = parseInt(charsBeforeSP[1]);
                } else {
                    ticketStoryPoints = parseInt(charsBeforeSP);
                }
                console.log({idx});
                console.log({ticket});
                console.log({ticketTitel});
                console.log({posOfSP});
                console.log({charsBeforeSP});
                ticketStoryPointsSum += ticketStoryPoints;

                console.log("added ticketStoryPoints", ticketStoryPoints);
                console.log("ticketTitel ", ticketTitel);
                console.log("ticketMemberName", ticketMemberName);

                //storyPointsByMemberAndStatus[ticketMemberName][spaltenname] += parseInt(ticketStoryPoints);
            }
        });

        // console.log('noStoryPointsFoundCounter');
        // console.log(noStoryPointsFoundCounter);
        // console.log('noStoryPointsFoundTicketnames');
        // console.log(noStoryPointsFoundTicketnames);

        $boardInner
            .find('.gitlab-board-helper-column-sum')
            //.html(ticketStoryPointsSum === 0 ? 'keine SP' : ticketStoryPointsSum + ' SP');
            .html(ticketStoryPointsSum + ' SP');

        if (columnName == COLUMN_NAME_CLOSED_THIS_SPRINT) {
            $('#gitlab-board-helper-global-sum-closed').html(ticketStoryPointsSum + ' SP');
        }
    } else {
        $boardInner
            .find('.gitlab-board-helper-column-sum')
            .html('Bitte scrollen');
    }
}

function addAdditionalCss() {
    let additional_css = [];
    additional_css.push('#gitlab_board_summary_table td { font-size: 11pt; text-align: center; }');
    additional_css.push('.gitlab-board-helper-story-points:after { content: \" SP\"}');
    additional_css.push('.gitlab-board-helper-board-helper { margin: 20px 10px 0px 10px; }');
    additional_css.push('.gitlab-board-helper-column-refresh-button { float: right; top: -20px; position: relative; }');
    additional_css.push('.gitlab-board-helper-column-activate-button { margin-bottom: 15px; }');
    additional_css.push('#gitlab-board-global-bar { font-size: 16pt; margin-left: 15px; display: flex; align-items: center; }');
    additional_css.push('#gitlab-board-helper-global-sum-active { margin-left: 5px; margin-top: 1px; }');
    additional_css.push('#gitlab-board-helper-global-sum-active:after { content: " SP" }');
    $('body').append('<style type="text/css">' + additional_css.join(' ') + '</style>');
}

function loadColumnsToShowFromChromeStorage() {
    // chrome.storage.local.get(['columnsToShow'], function(result) {
    //     if (result && result.columnsToShow) {
    //         columnsToShow = JSON.parse(result.columnsToShow);
    //     }
    // });
    columnsToShow = [
        COLUMN_NAME_SPRINT_BACKLOG,
        COLUMN_NAME_IN_PROGRESS,
        COLUMN_NAME_CONTENT_REVIEW,
        COLUMN_NAME_CODE_REVIEW,
        COLUMN_NAME_PO_REVIEW,
        COLUMN_NAME_CLOSED_THIS_SPRINT,
    ];
}

function loadGroupsFromChromeStorage() {
    chrome.storage.local.get(['groups'], function(result) {
        console.log('load result');
        if (result && result.groups) {
            groups = JSON.parse(result.groups);
            // initProjectSelect();
            console.log('set groups to');
            console.log(groups);

            teamMemberNames = [];
            $(groups).each(function(groupIdx, groupValue) {
                $(groups[groupIdx].memberNames).each(function(memberNameIdx, memberNameValue) {
                    teamMemberNames.push(memberNameValue);
                });
            });

            console.log('loadGroupsFromChromeStorage after step1');
            console.log(teamMemberNames);

            allMemberNames = collectMemberNamesFromBoard();
            $(allMemberNames).each(function(memberNameIdx, memberNameValue) {
                if (teamMemberNames.indexOf(memberNameValue) === -1) {
                    teamMemberNames.push(memberNameValue);
                }
            });

            console.log('loadGroupsFromChromeStorage result');
            console.log(teamMemberNames);
        } else {
            alert('Please check the extension options. No data loaded from chrome.storage');
        }
    });
}

// Extracts assigned persons from the tickets on the board
function collectMemberNamesFromBoard() {
    let tmpMemberNames = {};
    let returnMemberNames = [];
    $('.board-card-assignee img').each(function (boardCardAssigneeKey, boardCardAssigneeValue) {
        tmpMemberNames[$(boardCardAssigneeValue).attr('alt')] = '';
    });

    $(Object.keys(tmpMemberNames)).each(function (memberNamesIdx, memberName) {
        // "Avatar for Max Mustermann" -> "Max Mustermann"
        if (memberName.indexOf('Avatar for ') !== -1) {
            memberName = memberName.substr(11);
        }
        returnMemberNames.push(memberName);
    });

    // console.log('collectMemberNamesFromBoard returns');
    // console.log(returnMemberNames);
    return returnMemberNames;
}

function addRefreshAllButton() {
    $('.title-container ul.navbar-sub-nav').after(
        '' +
        '<button id="gitlab-board-helper-column-refresh-all-button">Alle aktualisieren</button>' +
        '<div id="gitlab-board-global-bar">Aktiv: <span>&#8721;</span><span id="gitlab-board-helper-global-sum-active"></span> Geschlossen: <span>&#8721;</span><span id="gitlab-board-helper-global-sum-closed"></span></div>'
    );
}

function addRandomValuesToBoardColumns() {
    console.log('addRandomValuesToBoardColumns');
    $(columnsToShow).each(function(spaltenIdx, spaltenValue) {
        $('.board-title-text span.gl-label-text:contains("' + spaltenValue + '")').parent().parent().parent().append('<span class="gitlab-board-helper-story-points" style="margin-left: 10px;">0</span>');
    });
}

function init() {
    console.log('init');

    // collectMemberNamesFromBoard();

    //loadColumnsToShowFromChromeStorage();

    let interval = setInterval(function() {
        setColumnsToShow();
        if (columnsToShow.length > 0) {
            clearInterval(interval);
            setTimeout(function () {
                console.log('timeout time has passed');
                loadGroupsFromChromeStorage();
                //memberNames = collectMemberNamesFromBoard();
                // addFixedButtonBar();

                //let $allColumnsHeadlines = $('.board-title-text span.gl-label-text');
                let $allColumnsHeadlines = $('.board-title-text span.gl-label-text, .board-title-text span[title]');
                $allColumnsHeadlines.each(function(allColumnsHeadlinesKey, allColumnsHeadlinesValue) {
                    addInitialHeaderForColumn($(allColumnsHeadlinesValue).text().trim());
                })

                addRandomValuesToBoardColumns();
                addRefreshAllButton();
                addAdditionalCss();

                console.log('in init');
                console.log(columnsToShow);
                $(columnsToShow).each(function(columnIdx, columnName) {
                    // addInitialHeaderForColumn(columnName);
                    activateStoryPointsForColumn(columnName);
                    //getStorypointsFromColumn(columnName);
                });
            }, 2000);
        }
    }, 1000);

    // while (spaltenToShow.length >= 1) {
    //     clearInterval(interval);
    //     console.log('interval cleared');
    // }
    // setSpaltenToShow();
}

init();

// document.write(
//'<script src="https://ajax.googleapis.com/ajax/libs/jquery/2.2.2/jquery.min.js" type="text/javascript"></script>'
// '<script src="https://ajax.googleapis.com/ajax/libs/jquery/3.5.1/jquery.min.js" type="text/javascript"></script>'
// '<script src="/thirdParty/jquery-2.2.4.min.js" type="text/javascript"></script>'
// );

$(document).on('click', '.gitlab-board-helper-column-activate-button', function() {
    const columnName = $(this).attr('data-column-name');
    activateStoryPointsForColumn(columnName);
});

$(document).on('click', '.gitlab-board-helper-column-refresh-button', function() {
    const columnName = $(this).attr('data-column-name');
    getStorypointsFromColumn(columnName);
});

$(document).on('click', '#gitlab-board-helper-column-refresh-all-button', function() {
    // Click every column-refresh button
    $('.gitlab-board-helper-column-refresh-button').click();
});

$(document).on('click', '#refresh-summary-button', function() {
    refreshSummary();
});