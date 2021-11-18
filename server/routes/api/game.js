const express = require('express');
const Room = require('../../models/Room');
const router = express.Router();

router.get('/:id', async (req, res) => {
  //Assign role

  let isTimeOut = false;
  const timeOutId = setTimeout(() => {
    //Trigger socket emit to all players that no one is killed
    isTimeOut = true;
  }, 15000);

  function onServerVote() {
    if (isTimeOut) {
      //inform user is not allowed
      return;
    }
    clearTimeout(timeOutId);
    //do some logic voting
    //emit socket to all players as this player is voted
  }
});

//POST players roles do vote
router.post('/:id/vote', async (req, res) => {});

module.exports = router;
