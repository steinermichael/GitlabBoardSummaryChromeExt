const presetGroups = [
    {
        groupName: 'Dev-Team',
        memberNames: [
        ],
    },
    {
        groupName: 'EPD',
        memberNames: [
        ],
    },
];

let groups = [];

// Shows an updating list of process statistics.
function init() {
    console.log('options.js init');

    $('#saveButton').on('click', saveData);
    $('#initWithPresetsButton').on('click', initWithPresets);

    chrome.storage.local.get(['groups'], function(result) {
        console.log('load result');
        if (result && result.groups) {
            groups = JSON.parse(result.groups);
        } else {
            console.log('no groups loaded from chrome.storage');
        }
        initSettingsFields();
    });
}

function initSettingsFields() {
    let fieldsArray = [];

    // Loop over projects
    $.each(groups, function(groupsKey, groupsValue) {
        console.log('groupsKey', groupsKey);
        console.log('groupsValue', groupsValue);
        let inputProjectNameId = 'inputProjectName' + groupsKey;
        fieldsArray.push('<hr/>');
        fieldsArray.push('<label for="' + inputProjectNameId + '">Gruppe:</label><br/>');
        fieldsArray.push('<input id="' + inputProjectNameId + '" type="text" data-group-index="' + groupsKey + '" data-input-type="projectName" value="' + groupsValue.groupName + '" />');
        fieldsArray.push('<button class="remove-project-button" data-group-index="' + groupsKey + '">Gruppe entfernen</button>');
        fieldsArray.push('<table>');
        fieldsArray.push('  <thead>');
        fieldsArray.push('      <th>');
        fieldsArray.push('          Name');
        fieldsArray.push('      </th>');
        fieldsArray.push('      <th>');
        fieldsArray.push('      </th>');
        fieldsArray.push('  </thead>');
        fieldsArray.push('  <tbody>');
        // Loop over memberNames
        $.each(groupsValue.memberNames, function(memberNameKey, memberNameValue) {
            fieldsArray.push('<tr>');
            fieldsArray.push('  <td>');
            fieldsArray.push('      <input data-group-index="' + groupsKey + '" data-member-name-index="' + memberNameKey + '" data-input-type="name" type="text" value="' + memberNameValue + '"/>');
            fieldsArray.push('  </td>');
            fieldsArray.push('  <td>');
            fieldsArray.push('      <button class="remove-url-button" data-group-index="' + groupsKey + '" data-member-name-index="' + memberNameKey + '">x</button>');
            fieldsArray.push('  </td>');
            fieldsArray.push('</tr>');
        });
        fieldsArray.push('      <tr>');
        fieldsArray.push('          <td colspan="2">');
        fieldsArray.push('              <button class="addUrlButton" data-group-index="' + groupsKey + '">Add</button>');
        fieldsArray.push('          </td>');
        fieldsArray.push('      </tr>');
        fieldsArray.push('  </tbody>');
        fieldsArray.push('</table>');
    });
    console.log($('#fields'));
    $('#fields').html(fieldsArray.join(''));
}

function initWithPresets() {
    console.log('initWithPresets');
    console.log(presetGroups);
    console.log(JSON.stringify(presetGroups));
    chrome.storage.local.set({'groups': JSON.stringify(presetGroups)}, function() {
        console.log('finished setting presetGroups');
    });
}

function saveData() {
    // Update groups from fields

    groups = [];
    let projectIndex = 0;

    // Loop over project input fields
    while ($('input[data-input-type="projectName"][data-group-index="' + projectIndex + '"]').length) {

        let tmpMemberNames = [];

        // TODO: jQuery is done twice - Improve this
        let $projectNameInput = $('input[data-input-type="projectName"][data-group-index="' + projectIndex + '"]')

        console.log('projectName: ', $projectNameInput.val());

        // Loop over url input fields within project
        let memberNameIndex = 0;
        while ($('input[data-group-index="' + projectIndex + '"][data-member-name-index="' + memberNameIndex + '"]').length) {

            let nameField = $('input[data-input-type="name"][data-group-index="' + projectIndex + '"][data-member-name-index="' + memberNameIndex + '"]');
            console.log('name: ', nameField.val());

            tmpMemberNames.push(nameField.val());

            memberNameIndex++;
        }

        groups.push({groupName: $projectNameInput.val(), memberNames: tmpMemberNames });

        projectIndex++;
    }

    // Save groups to chrome.storage

    console.log('saveData');

    chrome.storage.local.set({'groups': JSON.stringify(groups)}, function() {
        console.log('saved!');
    });
}

document.addEventListener('DOMContentLoaded', init);

// Update selectedProject when option was selected
$(document).on('click', '.addUrlButton', function() {
    console.log('button clicked');
    console.log($(this).attr('data-group-index'));
    let projectIndex = $(this).attr('data-group-index');

    groups[projectIndex].memberNames.push('');
    initSettingsFields();
});

$(document).on('click', '.remove-project-button', function() {
    const projectIndex = $(this).attr('data-group-index');
    groups.splice(projectIndex, 1);
    initSettingsFields();
});

$(document).on('click', '.remove-url-button', function() {
    const memberNameIndex = $(this).attr('data-member-name-index');
    const projectIndex = $(this).attr('data-group-index');
    groups[projectIndex].memberNames.splice(memberNameIndex, 1);
    initSettingsFields();
});

$(document).on('click', '#addProjectButton', function() {
    groups.push({projectName: 'PROJECTNAME', memberNames: ['']});
    initSettingsFields();
});
