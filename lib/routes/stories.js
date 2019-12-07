const router = require('express').Router();
const Story = require('../models/Story');
const Character = require('../models/Character');
const World = require('../models/World');
const Location = require('../models/Location');
const Chapter = require('../models/Chapter');
const ensureAuth = require('../middleware/ensure-auth');

router
  .post('/', ensureAuth, (req, res, next) => {
    const { storyTitle, storySynopsis, storyGenre, storyTags } = req.body;
    Story.create({
      userId: req.user.sub,
      storyTitle,
      storySynopsis,
      storyGenre,
      storyTags
    })
      .then(story => res.send(story))
      .catch(next);
  })
  .get('/', ensureAuth, (req, res, next) => {
    Story.find()
      .lean()
      .then(story => res.json(story))
      .catch(next);
  })
  .get('/:storyId', ensureAuth, ({ params }, res, next) => {
    return Promise.all([
      Story.findById(params.storyId)
        .lean(),
      Character.find({ characterStoryId: params.storyId })
        .select('userId characterStoryId characterName characterDescription characterTags')
        .lean(),
      World.find({ worldStoryId: params.storyId })
        .select('userId worldStoryId worldName worldDescription worldTags')
        .lean(),
      Location.find({ locationStoryId: params.storyId })
        .select('userId locationStoryId locationName locationDescription locationTags')
        .lean(),
      Chapter.find({ chapterStoryId: params.storyId })
        .select('userId chapterStoryId chapterName chapterText chapterTags')
        .lean()
    ])
      .then(([story, characters, worlds, locations, chapters]) => {
        story.characters = characters;
        story.worlds = worlds;
        story.locations = locations;
        story.chapters = chapters;
        res.json(story);
      })
      .catch(next);
  })
  .delete('/:storyId', ensureAuth, (req, res, next) => {
    Story.findByIdAndRemove(req.params.storyId)
      .then(deletedStory => res.json(deletedStory))
      .catch(next);
  });

module.exports = router;
