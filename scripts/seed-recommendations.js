import { Pool } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';

// Use SQL to insert recommendations directly
async function seedRecommendations() {
  console.log('Starting to seed seasonal recommendations...');
  
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  
  try {
    // Clear existing recommendations
    await pool.query('DELETE FROM seasonal_recommendations;');
    console.log('Cleared existing recommendations');
    
    // Comprehensive seasonal care recommendations
    const recommendations = [
      // SPRING - Tropical Plants
      ['spring', 'tropical', 'fertilizing', 'Begin Regular Fertilizing', 'Start feeding tropical plants every 2-3 weeks as they enter their growing season. Use a balanced liquid fertilizer diluted to half strength.', 'bi-weekly', 3, 1],
      ['spring', 'tropical', 'watering', 'Increase Watering Frequency', 'As temperatures warm and days lengthen, tropical plants will need more frequent watering. Check soil moisture every 2-3 days.', 'every 3 days', 3, 1],
      ['spring', 'tropical', 'humidity', 'Monitor Humidity Levels', 'Spring air can be dry. Maintain 50-60% humidity around tropical plants using humidity trays or humidifiers.', 'daily', 2, 1],
      ['spring', 'tropical', 'repotting', 'Consider Repotting', 'Spring is the ideal time to repot tropical plants that have outgrown their containers. Look for roots growing through drainage holes.', 'annually', 2, 1],
      
      // SPRING - Succulent Plants
      ['spring', 'succulent', 'watering', 'Resume Regular Watering', 'Begin watering succulents more frequently as they exit winter dormancy. Water thoroughly when soil is completely dry.', 'weekly', 3, 1],
      ['spring', 'succulent', 'fertilizing', 'Light Spring Feeding', 'Feed succulents with a diluted cactus fertilizer once monthly. Avoid over-fertilizing as it can cause soft, weak growth.', 'monthly', 2, 1],
      ['spring', 'succulent', 'lighting', 'Gradually Increase Light', 'Slowly acclimate succulents to brighter spring light to prevent sunburn. Move closer to windows over 1-2 weeks.', 'weekly', 2, 1],
      ['spring', 'succulent', 'repotting', 'Spring Repotting', 'Repot succulents that have outgrown their containers. Use well-draining cactus soil mix.', 'bi-annually', 2, 1],
      
      // SPRING - Flowering Plants
      ['spring', 'flowering', 'fertilizing', 'Bloom-Boosting Fertilizer', 'Use a phosphorus-rich fertilizer to encourage abundant spring blooms. Feed every 2 weeks during flowering period.', 'bi-weekly', 3, 1],
      ['spring', 'flowering', 'pruning', 'Deadhead Spent Blooms', 'Remove faded flowers to encourage continuous blooming and prevent the plant from putting energy into seed production.', 'weekly', 3, 1],
      ['spring', 'flowering', 'watering', 'Consistent Moisture', 'Maintain consistent soil moisture for flowering plants. Water when top inch of soil feels dry.', 'every 3 days', 3, 1],
      
      // SPRING - Foliage Plants
      ['spring', 'foliage', 'fertilizing', 'Nitrogen-Rich Feeding', 'Feed foliage plants with nitrogen-rich fertilizer to promote lush, green growth during the growing season.', 'bi-weekly', 3, 1],
      ['spring', 'foliage', 'pruning', 'Spring Pruning', 'Trim back any winter damage and shape plants for optimal growth. Remove yellow or damaged leaves.', 'monthly', 2, 1],
      ['spring', 'foliage', 'general_care', 'Dust Leaves', 'Clean leaves with a damp cloth to remove dust buildup and improve photosynthesis efficiency.', 'bi-weekly', 2, 1],
      
      // SPRING - Herbs
      ['spring', 'herb', 'fertilizing', 'Gentle Herb Feeding', 'Feed herbs with mild, organic fertilizer. Over-fertilizing can reduce essential oil concentration and flavor.', 'monthly', 2, 1],
      ['spring', 'herb', 'pruning', 'Pinch Growing Tips', 'Regularly pinch growing tips to encourage bushy growth and prevent herbs from becoming leggy.', 'weekly', 3, 1],
      ['spring', 'herb', 'general_care', 'Harvest Regularly', 'Begin regular harvesting to encourage new growth. Never harvest more than 1/3 of the plant at once.', 'weekly', 3, 1],
      
      // SUMMER - Tropical Plants
      ['summer', 'tropical', 'watering', 'Increase Summer Watering', 'Water tropical plants more frequently in summer heat. Check soil daily and water when top inch feels dry.', 'every 2 days', 3, 1],
      ['summer', 'tropical', 'humidity', 'Boost Humidity', 'Summer air conditioning can dry out air. Use humidifiers, pebble trays, or misting to maintain 60-70% humidity.', 'daily', 3, 1],
      ['summer', 'tropical', 'lighting', 'Protect from Harsh Sun', 'Shield tropical plants from intense summer sun with sheer curtains or move slightly away from south-facing windows.', 'as needed', 2, 1],
      ['summer', 'tropical', 'fertilizing', 'Peak Growing Season Feeding', 'Continue regular fertilizing through summer growing season. Feed every 2 weeks with balanced fertilizer.', 'bi-weekly', 3, 1],
      
      // SUMMER - Succulent Plants
      ['summer', 'succulent', 'watering', 'Deep but Infrequent Watering', 'Water succulents thoroughly but less frequently in summer. Allow soil to dry completely between waterings.', 'weekly', 3, 1],
      ['summer', 'succulent', 'lighting', 'Bright Light Management', 'Provide bright light but protect from scorching afternoon sun. Morning sun with afternoon shade is ideal.', 'daily monitoring', 3, 1],
      ['summer', 'succulent', 'temperature', 'Heat Protection', 'Protect succulents from extreme heat. Ensure good air circulation and avoid hot, enclosed spaces.', 'daily', 2, 1],
      
      // FALL - Tropical Plants
      ['fall', 'tropical', 'watering', 'Reduce Watering Frequency', 'Begin reducing watering frequency as growth slows. Allow soil to dry more between waterings.', 'every 4-5 days', 3, 1],
      ['fall', 'tropical', 'fertilizing', 'Reduce Fertilizing', 'Reduce fertilizing frequency to monthly or stop completely as plants prepare for dormancy.', 'monthly', 2, 1],
      ['fall', 'tropical', 'pest_control', 'Pre-Winter Pest Check', 'Inspect plants thoroughly for pests before bringing indoors or reducing care. Treat any issues found.', 'monthly', 3, 1],
      
      // FALL - Succulent Plants
      ['fall', 'succulent', 'watering', 'Prepare for Dormancy', 'Begin reducing watering as succulents enter dormancy period. Water only when soil is completely dry.', 'bi-weekly', 3, 1],
      ['fall', 'succulent', 'fertilizing', 'Stop Fall Fertilizing', 'Stop fertilizing succulents in fall to allow them to enter natural dormancy period.', 'stop until spring', 2, 1],
      
      // WINTER - Tropical Plants
      ['winter', 'tropical', 'watering', 'Winter Watering Reduction', 'Water tropical plants less frequently in winter. Soil should dry out more between waterings.', 'weekly', 3, 1],
      ['winter', 'tropical', 'humidity', 'Combat Dry Winter Air', 'Winter heating systems dry out air. Use humidifiers or group plants together to maintain humidity.', 'daily', 3, 1],
      ['winter', 'tropical', 'lighting', 'Supplement with Grow Lights', 'Consider using grow lights to supplement reduced winter daylight for tropical plants.', 'daily', 2, 1],
      ['winter', 'tropical', 'temperature', 'Protect from Cold', 'Keep tropical plants away from cold windows and heating vents. Maintain temperatures above 60°F.', 'daily monitoring', 3, 1],
      
      // WINTER - Succulent Plants
      ['winter', 'succulent', 'watering', 'Winter Dormancy Watering', 'Water succulents very sparingly during winter dormancy. Some may not need water for weeks.', 'monthly or less', 3, 1],
      ['winter', 'succulent', 'lighting', 'Maximize Winter Light', 'Place succulents in brightest available location during winter months when daylight is limited.', 'daily', 3, 1],
      ['winter', 'succulent', 'temperature', 'Cool Winter Rest', 'Allow succulents to experience cooler temperatures (50-60°F) for proper winter dormancy.', 'daily monitoring', 2, 1],
      
      // WINTER - Flowering Plants
      ['winter', 'flowering', 'watering', 'Reduced Winter Watering', 'Most flowering plants need less water in winter. Check soil moisture before watering.', 'weekly', 3, 1],
      ['winter', 'flowering', 'pruning', 'Winter Cleanup', 'Remove dead or yellowing leaves and spent flowers. Avoid heavy pruning during dormancy.', 'bi-weekly', 2, 1],
      
      // WINTER - Foliage Plants
      ['winter', 'foliage', 'watering', 'Winter Water Management', 'Reduce watering frequency for foliage plants during winter months when growth slows.', 'weekly', 3, 1],
      ['winter', 'foliage', 'general_care', 'Dust Removal', 'Clean leaves regularly during winter when windows are closed and dust accumulates more quickly.', 'bi-weekly', 2, 1],
      
      // WINTER - Herbs
      ['winter', 'herb', 'watering', 'Winter Herb Care', 'Water herbs less frequently in winter. Allow soil surface to dry between waterings.', 'weekly', 3, 1],
      ['winter', 'herb', 'lighting', 'Winter Light for Herbs', 'Provide supplemental lighting for herbs to maintain growth and flavor during winter months.', 'daily', 2, 1],
    ];
    
    // Insert recommendations
    for (const rec of recommendations) {
      await pool.query(`
        INSERT INTO seasonal_recommendations 
        (season, plant_category, recommendation_type, title, description, frequency, priority, is_active, created_at)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW())
      `, rec);
    }
    
    console.log(`Successfully seeded ${recommendations.length} seasonal recommendations!`);
    
    // Verify the data
    const result = await pool.query('SELECT COUNT(*) FROM seasonal_recommendations');
    console.log(`Verification: ${result.rows[0].count} recommendations in database`);
    
  } catch (error) {
    console.error('Error seeding recommendations:', error);
  } finally {
    await pool.end();
  }
}

seedRecommendations();