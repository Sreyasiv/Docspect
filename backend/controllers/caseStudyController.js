const { fetchCaseStudies } = require('../services/caseStudyService');

/**
 * Handle case study requests
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
async function caseStudyHandler(req, res) {
  try {
    const { risks, contractText } = req.body;  // ← extract contractText

    if (!risks || !Array.isArray(risks) || risks.length === 0) {
      return res.status(400).json({ error: 'No risks provided' });
    }

    console.log('Received risks:', JSON.stringify(risks, null, 2));
    console.log('Contract text length:', contractText?.length || 0);

    const caseStudies = await fetchCaseStudies(risks, contractText || "");  // ← pass it

    console.log(`Returned ${caseStudies.length} case studies`);

    return res.json({ ok: true, caseStudies });
  } catch (error) {
    console.error('Error in caseStudyHandler:', error.message);
    return res.status(500).json({ error: 'Failed to fetch case studies' });
  }
}

module.exports = { caseStudyHandler };