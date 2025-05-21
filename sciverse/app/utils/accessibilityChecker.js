"use client";

/**
 * Utility for conducting basic accessibility checks on lesson content
 */

/**
 * Basic accessibility check for HTML content
 * @param {string} htmlContent - The HTML content to check
 * @returns {Object} - Results of the accessibility check with issues and recommendations
 */
export function runAccessibilityCheck(htmlContent) {
  if (!htmlContent || typeof htmlContent !== 'string') {
    return {
      passed: false,
      issues: ["No content provided for accessibility check"],
      recommendations: []
    };
  }
  
  const issues = [];
  const recommendations = [];
  
  // Check for alt text on images
  const imgRegex = /<img[^>]*>/gi;
  const imgs = htmlContent.match(imgRegex) || [];
  
  imgs.forEach((img) => {
    if (!img.includes('alt=')) {
      issues.push("Image missing alt text");
      recommendations.push("Add descriptive alt text to all images");
    } else if (img.includes('alt=""') || img.includes("alt=''")) {
      issues.push("Image has empty alt text");
      recommendations.push("Provide meaningful alt text for images that convey information");
    }
  });
  
  // Check for heading hierarchy
  const headingRegex = /<h([1-6])[^>]*>(.*?)<\/h\1>/gi;
  const headings = [];
  let match;
  
  while ((match = headingRegex.exec(htmlContent)) !== null) {
    headings.push({
      level: parseInt(match[1], 10),
      text: match[2].replace(/<[^>]*>/g, '')
    });
  }
  
  // Check if headings are in sequential order
  for (let i = 0; i < headings.length - 1; i++) {
    if (headings[i + 1].level > headings[i].level + 1) {
      issues.push(`Non-sequential heading structure: H${headings[i].level} followed by H${headings[i + 1].level}`);
      recommendations.push("Ensure heading levels are sequential (don't skip levels)");
    }
  }
  
  // Check for empty links
  const linkRegex = /<a[^>]*>(.*?)<\/a>/gi;
  const links = htmlContent.match(linkRegex) || [];
  
  links.forEach((link) => {
    const linkContent = link.replace(/<a[^>]*>/, '').replace(/<\/a>/, '');
    if (!linkContent.trim() && !link.includes('aria-label')) {
      issues.push("Empty link without accessible name");
      recommendations.push("Add text content or aria-label to empty links");
    }
  });
  
  // Check for table headers
  if (htmlContent.includes('<table')) {
    if (!htmlContent.includes('<th') && !htmlContent.includes('role="rowheader"')) {
      issues.push("Table missing header cells");
      recommendations.push("Add <th> elements or role='rowheader' for table headers");
    }
    
    if (!htmlContent.includes('<caption>') && !htmlContent.includes('aria-label')) {
      issues.push("Table missing caption or label");
      recommendations.push("Add <caption> or aria-label to tables");
    }
  }
    // Check for motion sensitivity considerations
  if (htmlContent.includes('animation') || 
      htmlContent.includes('transition') || 
      htmlContent.includes('@keyframes')) {
    recommendations.push("Ensure animations respect user's prefers-reduced-motion setting");
    
    if (!htmlContent.includes('prefers-reduced-motion') && 
        !htmlContent.includes('reduced-motion') && 
        !htmlContent.includes('no-motion')) {
      issues.push("Animations without reduced motion alternatives");
    }
  }
  
  // Check for dyslexia-friendly text
  if (htmlContent.length > 500) {
    recommendations.push("Consider offering dyslexic-friendly font options");
  }
  
  // Check for color blindness considerations
  if (htmlContent.includes('color:') || 
      htmlContent.includes('background-color:') || 
      htmlContent.includes('fill:')) {
    recommendations.push("Ensure information is not conveyed by color alone for users with color blindness");
  }
  
  // Check for form labels
  if (htmlContent.includes('<input') || htmlContent.includes('<select') || htmlContent.includes('<textarea')) {
    if (!htmlContent.includes('<label') && !htmlContent.includes('aria-label') && !htmlContent.includes('aria-labelledby')) {
      issues.push("Form elements without associated labels");
      recommendations.push("Add labels to all form controls using <label>, aria-label, or aria-labelledby");
    }
  }
  
  // Deduplicate recommendations
  const uniqueRecommendations = [...new Set(recommendations)];
  
  return {
    passed: issues.length === 0,
    issues: issues,
    recommendations: uniqueRecommendations
  };
}

/**
 * Generates an accessibility report for lesson content
 * @param {Array} sections - Array of lesson sections
 * @returns {Array} - Array of section accessibility reports
 */
export function generateAccessibilityReport(sections) {
  if (!sections || !Array.isArray(sections)) {
    return [{
      title: "Error",
      issues: ["No valid sections provided"],
      recommendations: ["Provide valid lesson sections"]
    }];
  }
  
  return sections.map((section, index) => {
    const checkResults = runAccessibilityCheck(section.content);
    
    return {
      sectionNumber: index + 1,
      title: section.title,
      passed: checkResults.passed,
      issues: checkResults.issues,
      recommendations: checkResults.recommendations
    };
  });
}

/**
 * Checks if an HTML string uses semantic elements properly
 * @param {string} htmlContent - The HTML content to check
 * @returns {Object} - Analysis of semantic HTML usage
 */
export function analyzeSemanticMarkup(htmlContent) {
  if (!htmlContent) return { semanticScore: 0, issues: ["No content provided"] };
  
  let score = 100; // Start with perfect score
  const issues = [];
  
  // Check for semantic elements vs. div usage
  const divCount = (htmlContent.match(/<div/g) || []).length;
  const semanticTags = [
    'header', 'nav', 'main', 'article', 'section', 'aside', 
    'footer', 'figure', 'figcaption', 'details', 'summary'
  ];
  
  let semanticCount = 0;
  semanticTags.forEach(tag => {
    semanticCount += (htmlContent.match(new RegExp(`<${tag}`, 'g')) || []).length;
  });
  
  // If there are many divs and few semantic elements, reduce score
  if (divCount > 0 && semanticCount === 0) {
    score -= 30;
    issues.push("No semantic HTML elements used (e.g., section, article, figure)");
  } else if (divCount > 5 * semanticCount && divCount > 10) {
    score -= 20;
    issues.push("Heavy reliance on div elements instead of semantic HTML");
  }
  
  // Check for ARIA roles and attributes
  const ariaCount = (htmlContent.match(/aria-[a-z]+/g) || []).length;
  const roleCount = (htmlContent.match(/role=/g) || []).length;
  
  if (ariaCount === 0 && roleCount === 0) {
    score -= 15;
    issues.push("No ARIA attributes or roles used");
  }
  
  // Check for landmark regions
  const landmarks = [
    'role="banner"', 'role="navigation"', 'role="main"', 
    'role="complementary"', 'role="contentinfo"', '<header', '<nav', 
    '<main', '<aside', '<footer'
  ];
  
  let landmarkCount = 0;
  landmarks.forEach(landmark => {
    landmarkCount += (htmlContent.match(new RegExp(landmark, 'g')) || []).length;
  });
  
  if (landmarkCount === 0 && htmlContent.length > 500) {
    score -= 15;
    issues.push("No landmark regions identified (header, nav, main, etc.)");
  }
  
  // Ensure score doesn't go below 0
  score = Math.max(0, score);
  
  return {
    semanticScore: score,
    semanticLevel: score >= 80 ? "Good" : score >= 50 ? "Fair" : "Poor",
    issues: issues.length > 0 ? issues : ["No major semantic HTML issues detected"],
  };
}
