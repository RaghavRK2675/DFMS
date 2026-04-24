import mongoose from 'mongoose';

export const FeedRecord = mongoose.model(
  'FeedRecord',
  new mongoose.Schema({
    date: { type: String, required: true }, // 'Mon','Tue',...
    pigStarter: Number,
    pigGrower: Number,
    pigFinisher: Number,
    poultryStarter: Number,
    poultryGrower: Number,
    poultryLayer: Number,
  })
);

export const NutritionProfile = mongoose.model(
  'NutritionProfile',
  new mongoose.Schema({
    species: { type: String, enum: ['pig', 'poultry'], required: true },
    stage: { type: String, required: true },
    crudeProtein: Number,
    energy: Number,
    lysine: Number,
    threonine: Number,
    minerals: Number,
  })
);
