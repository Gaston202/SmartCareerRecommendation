// Central export file for all models
const Admin = require('./Admin');
const User = require('./User');
const Skill = require('./Skill');
const UserSkill = require('./UserSkill');
const Career = require('./Career');
const CareerSkill = require('./CareerSkill');
const Course = require('./Course');
const CourseSkill = require('./CourseSkill');
const Recommendation = require('./Recommendation');
const Analytics = require('./Analytics');

module.exports = {
  Admin,
  User,
  Skill,
  UserSkill,
  Career,
  CareerSkill,
  Course,
  CourseSkill,
  Recommendation,
  Analytics,
};
