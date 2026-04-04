require('dotenv').config();
const mongoose = require('mongoose');
const BloodSugar = require('../models/BloodSugar');
const connectDB = require('../config/database');

async function migrate() {
  try {
    await connectDB();
    console.log("Starting migration...");

    const records = await BloodSugar.find({});
    console.log(`Found ${records.length} records to evaluate.`);

    for (const record of records) {
      // If record is in old format (has fastingLevel or postMealLevel but not level/category)
      if (record.fastingLevel !== undefined || record.postMealLevel !== undefined) {
        console.log(`Migrating record for date: ${record.date}`);
        
        const fastingValue = record.fastingLevel;
        const postMealValue = record.postMealLevel;

        // Create Fasting record
        if (fastingValue !== undefined) {
          await BloodSugar.create({
            user: record.user,
            date: record.date, // keep original date
            level: fastingValue,
            category: 'fasting',
            notes: record.notes,
            mood: record.mood,
            exercise: record.exercise,
            medication: record.medication,
            medicationName: record.medicationName,
            mealDescription: record.mealDescription
          });
        }

        // Create Post-Meal record
        if (postMealValue !== undefined && postMealValue !== null) {
          // Add 2 hours to the date to separate it from fasting if they are on the same day
          const postMealDate = new Date(record.date);
          postMealDate.setHours(postMealDate.getHours() + 2);

          await BloodSugar.create({
            user: record.user,
            date: postMealDate,
            level: postMealValue,
            category: 'post-meal',
            notes: record.notes,
            mood: record.mood,
            exercise: record.exercise,
            medication: record.medication,
            medicationName: record.medicationName,
            mealDescription: record.mealDescription
          });
        }

        // Delete the old record
        await BloodSugar.findByIdAndDelete(record._id);
      }
    }

    console.log("Migration complete!");
    process.exit(0);
  } catch (err) {
    console.error("Migration failed:", err);
    process.exit(1);
  }
}

migrate();
