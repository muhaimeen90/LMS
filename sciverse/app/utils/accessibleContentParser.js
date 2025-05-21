"use client";

/**
 * Utility for making lesson HTML content more accessible to screen readers
 */

import DOMPurify from 'isomorphic-dompurify';

/**
 * Parse lesson content HTML and enhance it with proper accessibility attributes
 * @param {string} htmlContent - The raw HTML content
 * @returns {string} - Enhanced HTML with improved accessibility
 */
export function parseAccessibleContent(htmlContent) {
  if (!htmlContent) return '';
  
  // First, sanitize the content to prevent XSS attacks
  const cleanHtml = DOMPurify.sanitize(htmlContent);
  
  // If we're in the browser, use DOM manipulation for better parsing
  if (typeof document !== 'undefined') {
    const parser = new DOMParser();
    const doc = parser.parseFromString(cleanHtml, 'text/html');
    
    // Fix images
    const images = doc.querySelectorAll('img');
    images.forEach((img) => {
      // Add alt text if missing
      if (!img.hasAttribute('alt') || img.getAttribute('alt') === '') {
        img.setAttribute('alt', 'Lesson image');
      }
      
      // Add proper role
      img.setAttribute('role', 'img');
    });
    
    // Fix tables
    const tables = doc.querySelectorAll('table');
    tables.forEach((table) => {
      // Add role and caption for screen readers if missing
      table.setAttribute('role', 'grid');
      
      if (!table.querySelector('caption')) {
        const caption = doc.createElement('caption');
        caption.textContent = 'Lesson data table';
        table.prepend(caption);
      }
      
      // Make sure headers are properly marked
      const headerRow = table.querySelector('tr:first-child');
      if (headerRow) {
        const headerCells = headerRow.querySelectorAll('td');
        headerCells.forEach((cell) => {
          // Convert td to th for first row
          const th = doc.createElement('th');
          th.innerHTML = cell.innerHTML;
          th.setAttribute('scope', 'col');
          cell.parentNode.replaceChild(th, cell);
        });
      }
    });
    
    // Fix links
    const links = doc.querySelectorAll('a');
    links.forEach((link) => {
      // Add proper attributes for external links
      if (link.hasAttribute('target') && link.getAttribute('target') === '_blank') {
        link.setAttribute('rel', 'noopener noreferrer');
        if (!link.getAttribute('aria-label')) {
          link.setAttribute('aria-label', `${link.textContent} (opens in a new window)`);
        }
      }
    });
    
    // Fix heading hierarchy
    let headings = Array.from(doc.querySelectorAll('h1, h2, h3, h4, h5, h6'));
    
    // Check if there's no proper heading hierarchy
    if (headings.length > 0) {
      const firstHeadingLevel = parseInt(headings[0].tagName.substring(1));
      
      // If first heading isn't h2 (since the main content should start with h2, after the page h1)
      if (firstHeadingLevel !== 2) {
        headings.forEach((heading) => {
          const currentLevel = parseInt(heading.tagName.substring(1));
          const newLevel = Math.min(currentLevel - firstHeadingLevel + 2, 6);
          
          // Create a new heading of the appropriate level
          const newHeading = doc.createElement(`h${newLevel}`);
          newHeading.innerHTML = heading.innerHTML;
          
          // Copy attributes
          Array.from(heading.attributes).forEach(attr => {
            newHeading.setAttribute(attr.name, attr.value);
          });
          
          // Replace the old heading
          heading.parentNode.replaceChild(newHeading, heading);
        });
      }
    }
    
    // Make lists more accessible
    const lists = doc.querySelectorAll('ul, ol');
    lists.forEach((list) => {
      if (!list.getAttribute('role')) {
        list.setAttribute('role', 'list');
      }
      
      const items = list.querySelectorAll('li');
      items.forEach((item) => {
        item.setAttribute('role', 'listitem');
      });
    });
    
    // Get the enhanced HTML
    return doc.body.innerHTML;
  }
  
  // Fallback for server-side rendering with basic regex replacements
  let enhancedHtml = cleanHtml;
  
  // Add missing alt attributes to images
  enhancedHtml = enhancedHtml.replace(/<img([^>]*)>/gi, (match, attributes) => {
    if (!attributes.includes('alt=')) {
      return `<img${attributes} alt="Lesson image" role="img">`;
    } else if (attributes.includes('alt=""')) {
      return match.replace('alt=""', 'alt="Lesson image"');
    }
    return match.replace('<img', '<img role="img"');
  });
  
  // Make tables more accessible
  enhancedHtml = enhancedHtml.replace(/<table([^>]*)>/gi, '<table$1 role="grid">');
  
  // Enhance links with ARIA attributes when they open in new windows
  enhancedHtml = enhancedHtml.replace(/<a([^>]*)target="_blank"([^>]*)>/gi, 
    '<a$1target="_blank"$2 rel="noopener noreferrer">');
  
  return enhancedHtml;
}

/**
 * Create a text-only version of HTML content for screen readers
 * @param {string} htmlContent - The HTML content
 * @returns {string} - Plain text version of the content
 */
export function createScreenReaderText(htmlContent) {
  if (!htmlContent) return '';
  
  if (typeof document !== 'undefined') {
    const div = document.createElement('div');
    div.innerHTML = DOMPurify.sanitize(htmlContent);
    
    // Process images to add descriptive text
    const images = div.querySelectorAll('img');
    images.forEach(img => {
      const altText = img.getAttribute('alt') || 'image';
      const span = document.createElement('span');
      span.className = 'sr-only';
      span.textContent = `[Image: ${altText}]`;
      img.parentNode.insertBefore(span, img.nextSibling);
    });
    
    // Process tables to make them more understandable
    const tables = div.querySelectorAll('table');
    tables.forEach(table => {
      const span = document.createElement('span');
      span.className = 'sr-only';
      span.textContent = '[Table start]';
      table.parentNode.insertBefore(span, table);
      
      const endSpan = document.createElement('span');
      endSpan.className = 'sr-only';
      endSpan.textContent = '[Table end]';
      table.parentNode.insertBefore(endSpan, table.nextSibling);
    });
    
    return div.innerText || div.textContent || '';
  }
  
  // Simple fallback for server-side
  return htmlContent
    .replace(/<img[^>]*alt="([^"]*)"[^>]*>/gi, '[Image: $1]')
    .replace(/<img[^>]*>/gi, '[Image]')
    .replace(/<table[^>]*>/gi, '[Table start]')
    .replace(/<\/table>/gi, '[Table end]')
    .replace(/<[^>]*>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Extracts headings from HTML content for creating an accessible outline
 * @param {string} htmlContent - The HTML content
 * @returns {Array} - Array of heading objects with text and level
 */
export function extractHeadings(htmlContent) {
  if (!htmlContent) return [];
  
  const headings = [];
  
  if (typeof document !== 'undefined') {
    const div = document.createElement('div');
    div.innerHTML = DOMPurify.sanitize(htmlContent);
    
    const headingElements = div.querySelectorAll('h1, h2, h3, h4, h5, h6');
    headingElements.forEach(heading => {
      const level = parseInt(heading.tagName.substring(1));
      headings.push({
        text: heading.textContent,
        level: level
      });
    });
  } else {
    // Simple regex for server-side (less reliable)
    const regex = /<h([1-6])[^>]*>(.*?)<\/h\1>/gi;
    let match;
    
    while ((match = regex.exec(htmlContent)) !== null) {
      headings.push({
        text: match[2].replace(/<[^>]*>/g, ''),
        level: parseInt(match[1])
      });
    }
  }
  
  return headings;
}
