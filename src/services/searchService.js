// Search Service - Handles all search-related API calls and logic

export class SearchService {
  static searchCache = new Map();
  static suggestionCache = new Map();
  static cacheTimeout = 5 * 60 * 1000; // 5 minutes

  // Search intent detection
  static detectSearchIntent(query) {
    const normalizedQuery = query.toLowerCase().trim();

    const patterns = {
      university: /\b(university|college|institute|school|mit|stanford|harvard|berkeley|cmu)\b/i,
      professor: /\b(dr\.?|prof\.?|professor)\s/i,
      labName: /\b(lab|laboratory|group|center|institute)\b/i,
      researchArea: /\b(machine learning|ml|ai|computer vision|nlp|robotics|bioinformatics|hci)\b/i
    };

    for (const [intent, pattern] of Object.entries(patterns)) {
      if (pattern.test(normalizedQuery)) {
        return intent;
      }
    }

    return 'general';
  }

  // Get search intent metadata
  static getSearchIntentInfo(intent) {
    const intentMap = {
      university: {
        icon: 'School',
        color: '#2563EB',
        label: 'University',
        placeholder: 'Search universities...'
      },
      professor: {
        icon: 'User',
        color: '#10B981',
        label: 'Professor',
        placeholder: 'Search professors...'
      },
      labName: {
        icon: 'Beaker',
        color: '#8B5CF6',
        label: 'Lab',
        placeholder: 'Search lab names...'
      },
      researchArea: {
        icon: 'Beaker',
        color: '#F59E0B',
        label: 'Research Area',
        placeholder: 'Search research areas...'
      },
      general: {
        icon: 'Search',
        color: '#2563EB',
        label: 'Search',
        placeholder: 'Search labs, professors, universities...'
      }
    };
    return intentMap[intent] || intentMap.general;
  }

  // Get search suggestions
  static async getSearchSuggestions(query) {
    if (query.length < 2) return [];

    const cacheKey = `suggestions_${query}`;
    const cached = this.suggestionCache.get(cacheKey);

    if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
      return cached.data;
    }

    try {
      // For now, return mock suggestions - replace with actual API call
      const mockSuggestions = this.getMockSuggestions(query);

      this.suggestionCache.set(cacheKey, {
        data: mockSuggestions,
        timestamp: Date.now()
      });

      return mockSuggestions;
    } catch (error) {
      console.error('Error fetching suggestions:', error);
      return this.getFallbackSuggestions();
    }
  }

  // Perform search with filters
  static async searchLabs(query, filters = {}, page = 1, pageSize = 20) {
    const cacheKey = `search_${JSON.stringify({ query, filters, page, pageSize })}`;
    const cached = this.searchCache.get(cacheKey);

    if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
      return cached.data;
    }

    try {
      // For now, return mock data - replace with actual API call
      const mockResults = await this.getMockSearchResults(query, filters, page, pageSize);

      this.searchCache.set(cacheKey, {
        data: mockResults,
        timestamp: Date.now()
      });

      return mockResults;
    } catch (error) {
      console.error('Error searching labs:', error);
      throw new Error('Failed to search labs. Please try again.');
    }
  }

  // Get popular labs (for initial load)
  static async getPopularLabs() {
    try {
      return await this.searchLabs('', {}, 1, 10);
    } catch (error) {
      console.error('Error fetching popular labs:', error);
      return { results: [], total: 0, page: 1, hasMore: false };
    }
  }

  // Mock suggestions (replace with actual API)
  static getMockSuggestions(query) {
    const allSuggestions = [
      'Computer Vision Lab',
      'Machine Learning Research',
      'Stanford University',
      'MIT CSAIL',
      'Dr. Sarah Chen',
      'Natural Language Processing',
      'Robotics Lab',
      'Carnegie Mellon University',
      'Berkeley AI Research',
      'Deep Learning Group'
    ];

    return allSuggestions
      .filter(suggestion =>
        suggestion.toLowerCase().includes(query.toLowerCase())
      )
      .slice(0, 5);
  }

  // Fallback suggestions when API fails
  static getFallbackSuggestions() {
    return [
      'Computer Vision',
      'Machine Learning',
      'Natural Language Processing',
      'Robotics',
      'Stanford University'
    ];
  }

  // Mock search results (replace with actual API)
  static async getMockSearchResults(query, filters, page, pageSize) {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 300));

    const allLabs = [
      {
        id: '1',
        labName: 'Computer Vision Lab',
        professorName: 'Dr. Sarah Chen',
        universityName: 'Stanford University',
        department: 'Computer Science',
        researchGroup: 'AI Research Group',
        overallRating: 4.8,
        reviewCount: 24,
        researchAreas: ['Computer Vision', 'Machine Learning', 'Deep Learning'],
        tags: ['Well Funded', 'International Friendly', 'PhD Recruiting'],
        recruitmentStatus: { phd: true, postdoc: false, intern: true },
        description: 'Leading research in computer vision and deep learning applications.'
      },
      {
        id: '2',
        labName: 'Robotics and AI Lab',
        professorName: 'Dr. Michael Johnson',
        universityName: 'MIT',
        department: 'Electrical Engineering',
        researchGroup: 'Robotics Division',
        overallRating: 4.6,
        reviewCount: 18,
        researchAreas: ['Robotics', 'AI', 'Control Systems'],
        tags: ['Collaborative', 'Good Work-Life Balance'],
        recruitmentStatus: { phd: true, postdoc: true, intern: false },
        description: 'Cutting-edge research in autonomous systems and robotics.'
      },
      {
        id: '3',
        labName: 'Natural Language Processing Lab',
        professorName: 'Dr. Emily Zhang',
        universityName: 'Carnegie Mellon University',
        department: 'Language Technologies Institute',
        researchGroup: 'NLP Research Group',
        overallRating: 4.9,
        reviewCount: 31,
        researchAreas: ['NLP', 'Computational Linguistics', 'Machine Learning'],
        tags: ['Cutting-edge Research', 'International Friendly', 'Well Funded'],
        recruitmentStatus: { phd: true, postdoc: false, intern: true },
        description: 'Advanced natural language understanding and generation research.'
      },
      {
        id: '4',
        labName: 'Human-Computer Interaction Lab',
        professorName: 'Dr. Alex Kim',
        universityName: 'UC Berkeley',
        department: 'EECS',
        researchGroup: 'HCI Research',
        overallRating: 4.7,
        reviewCount: 15,
        researchAreas: ['HCI', 'User Experience', 'Design'],
        tags: ['User-Centered', 'Interdisciplinary'],
        recruitmentStatus: { phd: false, postdoc: true, intern: true },
        description: 'Exploring the future of human-computer interaction.'
      }
    ];

    // Apply filters
    let filteredLabs = [...allLabs];

    // Search query filter
    if (query.trim()) {
      const queryLower = query.toLowerCase();
      filteredLabs = filteredLabs.filter(lab =>
        lab.labName.toLowerCase().includes(queryLower) ||
        lab.professorName.toLowerCase().includes(queryLower) ||
        lab.universityName.toLowerCase().includes(queryLower) ||
        lab.researchAreas.some(area => area.toLowerCase().includes(queryLower)) ||
        lab.description.toLowerCase().includes(queryLower)
      );
    }

    // Rating filter
    if (filters.rating > 0) {
      filteredLabs = filteredLabs.filter(lab => lab.overallRating >= filters.rating);
    }

    // University filter
    if (filters.universities?.length > 0) {
      filteredLabs = filteredLabs.filter(lab =>
        filters.universities.includes(lab.universityName)
      );
    }

    // Research areas filter
    if (filters.researchAreas?.length > 0) {
      filteredLabs = filteredLabs.filter(lab =>
        lab.researchAreas.some(area => filters.researchAreas.includes(area))
      );
    }

    // Tags filter
    if (filters.tags?.length > 0) {
      filteredLabs = filteredLabs.filter(lab =>
        lab.tags.some(tag => filters.tags.includes(tag))
      );
    }

    // Sort results
    this.sortResults(filteredLabs, filters.sortBy || 'rating');

    // Pagination
    const startIndex = (page - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    const paginatedResults = filteredLabs.slice(startIndex, endIndex);

    return {
      results: paginatedResults,
      total: filteredLabs.length,
      page,
      pageSize,
      hasMore: endIndex < filteredLabs.length
    };
  }

  // Sort search results
  static sortResults(results, sortBy) {
    switch (sortBy) {
      case 'rating':
        results.sort((a, b) => b.overallRating - a.overallRating);
        break;
      case 'reviews':
        results.sort((a, b) => b.reviewCount - a.reviewCount);
        break;
      case 'labName':
        results.sort((a, b) => a.labName.localeCompare(b.labName));
        break;
      case 'professor':
        results.sort((a, b) => a.professorName.localeCompare(b.professorName));
        break;
      case 'university':
        results.sort((a, b) => a.universityName.localeCompare(b.universityName));
        break;
      default:
        // Default to rating
        results.sort((a, b) => b.overallRating - a.overallRating);
    }
  }

  // Clear cache
  static clearCache() {
    this.searchCache.clear();
    this.suggestionCache.clear();
  }

  // Get available filter options
  static getFilterOptions() {
    return {
      universities: [
        'Stanford University',
        'MIT',
        'Carnegie Mellon University',
        'UC Berkeley',
        'Harvard University',
        'University of Washington',
        'Georgia Tech',
        'Caltech'
      ],
      researchAreas: [
        'Machine Learning',
        'Computer Vision',
        'Natural Language Processing',
        'Robotics',
        'Human-Computer Interaction',
        'Bioinformatics',
        'Computer Graphics',
        'Cybersecurity',
        'Database Systems',
        'Distributed Systems'
      ],
      tags: [
        'Well Funded',
        'International Friendly',
        'Good Work-Life Balance',
        'Cutting-edge Research',
        'Collaborative',
        'Industry Connections',
        'Publication Focused',
        'Startup Friendly',
        'Remote Friendly',
        'Diverse Team'
      ],
      sortOptions: [
        { value: 'rating', label: 'Highest Rating' },
        { value: 'reviews', label: 'Most Reviews' },
        { value: 'labName', label: 'Lab Name (A-Z)' },
        { value: 'professor', label: 'Professor Name (A-Z)' },
        { value: 'university', label: 'University Name (A-Z)' }
      ]
    };
  }
}