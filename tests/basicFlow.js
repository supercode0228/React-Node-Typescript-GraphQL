describe('Basic flow', function() {

  const pauseTime = 500;
  const waitTime = 5000;



  test('Add/remove job skills', function (browser) {
    const targetSkill = 'Graphic Design';

    browser
      .login('test@Tests.com', 'd2N#843dn@d92sj1!0rd')

      .click('.nav-links a[href="/skills/job"]')
      .waitForElementVisible('.add-btn', waitTime)
      .pause(pauseTime)
      .click('.add-btn')
      
      .log('Make sure the target skill is not assigned to the user yet')
      .execute(function() {
        const targetSkill = 'Graphic Design';
        const existingSkill = document.querySelector('.selected-skills .found-skill:last-child');
        if(existingSkill.textContent.includes(targetSkill)) {
          document.querySelector('.selected-skills .found-skill:last-child .close').click();
        }
      })

      .assert.elementCount('.bubbles .dynamic-bubble', 1)
    
      .log('Find and add a new skill')
      .waitForElementVisible('.skill-search-bar', waitTime)
      .setValue('.skill-search-bar', 'gra')
      .assert.containsText('.skill-suggestions .found-skill:first-child', targetSkill)
      .log('Add the skill')
      .click('.skill-suggestions .found-skill:first-child')
      // The skill has appeared in the assigned skills list
      .assert.containsText('.selected-skills .found-skill:last-child', targetSkill)
      // The skill bubble was added
      .assert.elementCount('.bubbles .dynamic-bubble', 2)

      .log('Remove the skill')
      .click('.selected-skills .found-skill:last-child .close')
      .assert.elementCount('.bubbles .dynamic-bubble', 1);
    
    browser.end();
  });



  test('Add/remove software skills', function (browser) {
    const targetSkill = 'Kali Linux';

    browser
      .login('test@Tests.com', 'd2N#843dn@d92sj1!0rd')

      .click('.nav-links a[href="/skills/job"]')
      .waitForElementVisible('.skill-type-switch-editor', waitTime)
      .pause(pauseTime)
      .click('.skill-type-switch-editor a[href="./software"]')
      .waitForElementVisible('.skill-sectors', waitTime)
      .waitForElementVisible('.add-btn', waitTime)
      .pause(pauseTime)
      .click('.add-btn')
      
      .log('Make sure the target skill is not assigned to the user yet')
      .execute(function() {
        const targetSkill = 'Kali Linux';
        const existingSkill = document.querySelector(`.skill-sectors .software-skill-sector-icon[title="${targetSkill}"]`);
        if(existingSkill) {
          existingSkill.click();
          document.querySelector('.remove-skill').click();
        }
      })

      .assert.elementCount('.skill-sectors .software-skill-sector-icon', 3)
    
      .log('Find and add a new skill')
      .waitForElementVisible('.skill-search-bar', waitTime)
      .setValue('.skill-search-bar', 'kali')
      .assert.containsText('.skill-suggestions .software-skill-item:first-child', targetSkill)
      .log('Add the skill')
      .click('.skill-suggestions .software-skill-item:first-child')

      // The skill dan editor has opened
      .assert.visible('.skill-dan-editor')
      .log('Select the skill level')
      .click('.belt-color-group:nth-child(2) .belt-color:nth-child(2)')
      .click('.done-btn')

      // The skill sector was added
      .assert.elementCount('.skill-sectors .software-skill-sector-icon', 4)

      .log('Remove the skill')
      .pause(pauseTime)
      .execute(function() {
        const targetSkill = 'Kali Linux';
        document.querySelector(`.skill-sectors .software-skill-sector-icon[title="${targetSkill}"]`).click();
      })
      .click('.remove-skill')
      .assert.elementCount('.skill-sectors .software-skill-sector-icon', 3);
    
    browser.end();
  });



  // test('Verify dashboard content', function(browser) {
  //   browser
  //     .login('test@Tests.com', 'd2N#843dn@d92sj1!0rd')
  //     // .assert.containsText('.mainline-results', 'Nightwatch.js')
    
  //     // There should be 3 software skills
  //     .assert.elementCount('.skill-sectors .software-skill-sector-icon', 3);
    
  //   browser.end();
  // });

});
