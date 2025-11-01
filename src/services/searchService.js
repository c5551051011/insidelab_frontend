// Search Service - Handles all search-related API calls and logic

const API_BASE_URL = 'https://insidelab.up.railway.app/api/v1';

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

  // Perform search with filters (now using professors API)
  static async searchLabs(query, filters = {}, page = 1, pageSize = 20) {
    const cacheKey = `search_${JSON.stringify({ query, filters, page, pageSize })}`;
    const cached = this.searchCache.get(cacheKey);

    if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
      return cached.data;
    }

    try {
      // Build query parameters
      const params = new URLSearchParams();

      if (query.trim()) {
        params.append('search', query.trim());
      }

      // Add pagination
      params.append('page', page.toString());
      params.append('page_size', pageSize.toString());

      // Add filters if they exist
      if (filters.universities?.length > 0) {
        filters.universities.forEach(uni => params.append('university', uni));
      }

      if (filters.researchAreas?.length > 0) {
        filters.researchAreas.forEach(area => params.append('research_area', area));
      }

      if (filters.rating > 0) {
        params.append('min_rating', filters.rating.toString());
      }

      const url = `${API_BASE_URL}/professors/?fields=minimal&${params.toString()}`;
      console.log('Fetching professors from:', url);

      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`API request failed: ${response.status}`);
      }

      const data = await response.json();

      // Transform API data to match our expected format
      const transformedResults = this.transformProfessorsApiResults(data, page, pageSize);

      this.searchCache.set(cacheKey, {
        data: transformedResults,
        timestamp: Date.now()
      });

      return transformedResults;
    } catch (error) {
      console.error('Error searching professors:', error);
      throw new Error('Failed to search professors. Please try again.');
    }
  }

  // Transform Professors API results to match our expected format
  static transformProfessorsApiResults(apiData, page, pageSize) {
    if (!apiData || !apiData.results) {
      return { results: [], total: 0, page, hasMore: false };
    }

    const transformedLabs = apiData.results.map(professor => ({
      id: professor.lab?.id?.toString() || professor.id.toString(),
      labName: professor.lab?.name || `${professor.name}'s Research`,
      professorName: professor.name,
      universityName: professor.university_name || 'Unknown University',
      department: professor.department_name || 'Unknown Department',
      researchGroup: professor.research_group_name || '',
      overallRating: parseFloat(professor.overall_rating) || 0,
      reviewCount: professor.review_count || 0,
      researchAreas: professor.research_areas || [],
      tags: professor.tags || [],
      recruitmentStatus: professor.recruitment_status || { phd: false, postdoc: false, intern: false },
      description: professor.bio || '',
      website: professor.lab?.website || professor.personal_website || '',
      labSize: null,
      professorNames: [professor.name],
      professorEmail: professor.email || '',
      // Add ID fields for write review functionality
      professorId: professor.id?.toString() || '',
      universityId: professor.university_id?.toString() || '',
      departmentId: professor.department_id?.toString() || '',
      researchGroupId: professor.research_group_id?.toString() || '',
      labId: professor.lab?.id?.toString() || '',
      // Map recruitment status to expected format
      isRecruiting: {
        phd: professor.recruitment_status?.is_recruiting_phd || false,
        postdoc: professor.recruitment_status?.is_recruiting_postdoc || false,
        intern: professor.recruitment_status?.is_recruiting_intern || false
      }
    }));

    // Calculate total from API response
    const total = apiData.count || apiData.total || apiData.results.length;

    // Check if there are more pages based on next/previous pagination
    const hasMore = Boolean(apiData.next) || (page * pageSize) < total;

    return {
      results: transformedLabs,
      total,
      page,
      pageSize,
      hasMore
    };
  }

  // Transform API results to match our expected format (keeping for backward compatibility)
  static transformApiResults(apiData, page, pageSize) {
    if (!apiData || !apiData.results) {
      return { results: [], total: 0, page, hasMore: false };
    }

    const transformedLabs = apiData.results.map(lab => ({
      id: lab.id.toString(),
      labName: lab.name,
      professorName: lab.head_professor_name ||
                   (lab.professor_names && lab.professor_names.length > 0 ? lab.professor_names[0] : 'Unknown'),
      universityName: lab.university_name,
      department: lab.department,
      researchGroup: lab.research_group_name,
      overallRating: parseFloat(lab.overall_rating) || 0,
      reviewCount: lab.review_count || 0,
      researchAreas: lab.research_areas || [],
      tags: lab.tags || [],
      recruitmentStatus: lab.recruitment_status || { phd: false, postdoc: false, intern: false },
      description: lab.description || '',
      website: lab.website || '',
      labSize: lab.lab_size || null,
      // Additional fields from API
      professorNames: lab.professor_names || []
    }));

    // Calculate total from API response
    const total = apiData.count || apiData.total || apiData.results.length;

    // Check if there are more pages based on next/previous pagination
    const hasMore = Boolean(apiData.next) || (page * pageSize) < total;

    return {
      results: transformedLabs,
      total,
      page,
      pageSize,
      hasMore
    };
  }

  // Get popular labs (for initial load - now using professors)
  static async getPopularLabs() {
    try {
      return await this.searchLabs('', {}, 1, 10);
    } catch (error) {
      console.error('Error fetching popular professors:', error);
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

  // Get lab by name (now using professors API)
  static async getLabByName(labName) {
    try {
      // Convert URL name back to search term (replace dashes with spaces)
      const searchTerm = labName.replace(/-/g, ' ');
      const searchUrl = `${API_BASE_URL}/professors/?fields=minimal&search=${encodeURIComponent(searchTerm)}`;
      console.log('Searching for professor/lab with term:', searchTerm, 'URL:', searchUrl);

      const searchResponse = await fetch(searchUrl);
      if (!searchResponse.ok) {
        throw new Error(`Search request failed: ${searchResponse.status}`);
      }

      const searchData = await searchResponse.json();
      console.log('Search results:', searchData.results?.map(prof => ({
        name: prof.name,
        lab: prof.lab?.name,
        urlName: (prof.lab?.name || `${prof.name}'s Research`).toLowerCase().replace(/\s+/g, '-')
      })));

      // Find exact match by lab name (convert to URL format for comparison)
      const exactMatch = searchData.results?.find(professor => {
        const labUrlName = (professor.lab?.name || `${professor.name}'s Research`).toLowerCase().replace(/\s+/g, '-');
        console.log('Comparing:', labUrlName, 'with', labName.toLowerCase());
        return labUrlName === labName.toLowerCase();
      });

      if (!exactMatch) {
        console.error('No exact match found for:', labName);
        console.error('Available professors/labs:', searchData.results?.map(prof => ({
          professor: prof.name,
          lab: prof.lab?.name
        })));
        throw new Error('Lab not found');
      }

      console.log('Found exact match:', exactMatch.name, 'Lab:', exactMatch.lab?.name);

      // If there's a lab, get detailed lab data, otherwise use professor data
      if (exactMatch.lab?.id) {
        const detailUrl = `${API_BASE_URL}/labs/${exactMatch.lab.id}/`;
        console.log('Fetching lab details from:', detailUrl);

        const response = await fetch(detailUrl);
        if (!response.ok) {
          throw new Error(`API request failed: ${response.status}`);
        }

        const data = await response.json();

        // Transform lab data to match our expected format
        return {
          id: data.id.toString(),
          labName: data.name,
          professorName: data.head_professor?.name || exactMatch.name,
          universityName: data.university_name || exactMatch.university_name,
          department: data.department_name || data.department || exactMatch.department_name,
          researchGroup: data.research_group_name || exactMatch.research_group_name || '',
          overallRating: parseFloat(data.overall_rating) || parseFloat(exactMatch.overall_rating) || 0,
          reviewCount: data.review_count || exactMatch.review_count || 0,
          researchAreas: data.research_areas || exactMatch.research_areas || [],
          tags: data.tags || exactMatch.tags || [],
          recruitmentStatus: data.recruitment_status || exactMatch.recruitment_status || { phd: false, postdoc: false, intern: false },
          description: data.description || exactMatch.bio || '',
          website: data.website || exactMatch.lab?.website || '',
          labSize: data.lab_size || null,
          professorNames: [data.head_professor?.name || exactMatch.name].filter(Boolean),
          // Additional fields from the API response
          establishedYear: data.established_year || null,
          location: data.location || '',
          facilities: data.facilities || [],
          publications: data.recent_publications || [],
          collaborations: data.collaborations || [],
          fundingSources: data.funding_sources || [],
          hierarchyLine: data.hierarchy_line || '',
          researchTopics: data.research_topics || exactMatch.research_topics || [],
          professorEmail: data.head_professor?.email || exactMatch.email || '',
          professorWebsite: data.head_professor?.personal_website || '',
          professorScholarUrl: data.head_professor?.google_scholar_url || '',
          ratingBreakdown: data.rating_breakdown || null
        };
      } else {
        // No lab associated, create virtual lab from professor data
        return {
          id: exactMatch.id.toString(),
          labName: `${exactMatch.name}'s Research`,
          professorName: exactMatch.name,
          universityName: exactMatch.university_name || 'Unknown University',
          department: exactMatch.department_name || 'Unknown Department',
          researchGroup: exactMatch.research_group_name || '',
          overallRating: parseFloat(exactMatch.overall_rating) || 0,
          reviewCount: exactMatch.review_count || 0,
          researchAreas: exactMatch.research_areas || [],
          tags: exactMatch.tags || [],
          recruitmentStatus: exactMatch.recruitment_status || { phd: false, postdoc: false, intern: false },
          description: exactMatch.bio || '',
          website: exactMatch.personal_website || '',
          labSize: null,
          professorNames: [exactMatch.name],
          establishedYear: null,
          location: '',
          facilities: [],
          publications: [],
          collaborations: [],
          fundingSources: [],
          hierarchyLine: '',
          researchTopics: exactMatch.research_topics || [],
          professorEmail: exactMatch.email || '',
          professorWebsite: exactMatch.personal_website || '',
          professorScholarUrl: exactMatch.google_scholar_url || '',
          ratingBreakdown: null
        };
      }
    } catch (error) {
      console.error('Error fetching lab by name:', error);
      throw new Error('Failed to fetch lab details. Please try again.');
    }
  }

  // Get lab by ID (keeping for backward compatibility)
  static async getLabById(labId) {
    try {
      const url = `${API_BASE_URL}/labs/${labId}/`;
      console.log('Fetching lab from:', url);

      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`API request failed: ${response.status}`);
      }

      const data = await response.json();

      // Transform single lab data to match our expected format
      return {
        id: data.id.toString(),
        labName: data.name,
        professorName: data.head_professor?.name || 'Unknown',
        universityName: data.university_name,
        department: data.department_name || data.department,
        researchGroup: data.research_group_name || '',
        overallRating: parseFloat(data.overall_rating) || 0,
        reviewCount: data.review_count || 0,
        researchAreas: data.research_areas || [],
        tags: data.tags || [],
        recruitmentStatus: data.recruitment_status || { phd: false, postdoc: false, intern: false },
        description: data.description || '',
        website: data.website || '',
        labSize: data.lab_size || null,
        professorNames: [data.head_professor?.name].filter(Boolean) || [],
        // Additional fields from the API response
        establishedYear: data.established_year || null,
        location: data.location || '',
        facilities: data.facilities || [],
        publications: data.recent_publications || [],
        collaborations: data.collaborations || [],
        fundingSources: data.funding_sources || [],
        hierarchyLine: data.hierarchy_line || '',
        researchTopics: data.research_topics || [],
        professorEmail: data.head_professor?.email || '',
        professorWebsite: data.head_professor?.personal_website || '',
        professorScholarUrl: data.head_professor?.google_scholar_url || '',
        ratingBreakdown: data.rating_breakdown || null,
        // Add ID fields for write review functionality
        professorId: data.head_professor?.id?.toString() || '',
        universityId: data.university_id?.toString() || '',
        departmentId: data.department_id?.toString() || '',
        researchGroupId: data.research_group_id?.toString() || '',
        labId: data.id?.toString() || ''
      };
    } catch (error) {
      console.error('Error fetching lab by ID:', error);
      throw new Error('Failed to fetch lab details. Please try again.');
    }
  }

  // Get professor by ID with complete data including all IDs
  static async getProfessorById(professorId) {
    try {
      const url = `${API_BASE_URL}/professors/${professorId}/`;
      console.log('Fetching professor from:', url);

      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`API request failed: ${response.status}`);
      }

      const data = await response.json();

      // Transform professor data to match our expected lab format
      return {
        id: data.lab?.id?.toString() || data.id.toString(),
        labName: data.lab?.name || `${data.name}'s Research`,
        professorName: data.name,
        universityName: data.university_name || 'Unknown University',
        department: data.department_name || 'Unknown Department',
        researchGroup: data.research_group_name || '',
        overallRating: parseFloat(data.overall_rating) || 0,
        reviewCount: data.review_count || 0,
        researchAreas: data.research_areas || [],
        tags: data.tags || [],
        recruitmentStatus: data.recruitment_status || { phd: false, postdoc: false, intern: false },
        description: data.bio || '',
        website: data.lab?.website || data.personal_website || '',
        labSize: null,
        professorNames: [data.name],
        professorEmail: data.email || '',
        // Complete ID fields for write review functionality
        professorId: data.id?.toString() || '',
        universityId: data.university_id?.toString() || '',
        departmentId: data.department_id?.toString() || '',
        researchGroupId: data.research_group_id?.toString() || '',
        labId: data.lab?.id?.toString() || '',
        // Additional professor-specific fields
        professorWebsite: data.personal_website || '',
        professorScholarUrl: data.google_scholar_url || '',
        publications: data.recent_publications || [],
        ratingBreakdown: data.rating_breakdown || null
      };
    } catch (error) {
      console.error('Error fetching professor by ID:', error);
      throw new Error('Failed to fetch professor details. Please try again.');
    }
  }

  // Get available filter options (optimized with dedicated APIs)
  static async getFilterOptions() {
    try {
      // Fetch filter options from multiple APIs in parallel for better performance
      const [universitiesResponse, professorsResponse] = await Promise.all([
        fetch(`${API_BASE_URL}/universities/?fields=minimal`),
        fetch(`${API_BASE_URL}/professors/?fields=minimal&page_size=1000`)
      ]);

      if (!universitiesResponse.ok || !professorsResponse.ok) {
        throw new Error('Failed to fetch filter options');
      }

      const [universitiesData, professorsData] = await Promise.all([
        universitiesResponse.json(),
        professorsResponse.json()
      ]);

      // Extract universities from dedicated API (faster and more reliable)
      const universities = universitiesData.results?.map(uni => uni.name).filter(Boolean).sort() || [];

      // Extract other filter options from professors data
      const professors = professorsData.results || [];
      const departments = [...new Set(professors.map(prof => prof.department_name).filter(Boolean))].sort();
      const researchGroups = [...new Set(professors.map(prof => prof.research_group_name).filter(Boolean))].sort();

      // Extract research areas (flattened from all professors)
      const allResearchAreas = professors.flatMap(prof => prof.research_areas || []);
      const researchAreas = [...new Set(allResearchAreas)].filter(Boolean).sort();

      // Extract tags (flattened from all professors)
      const allTags = professors.flatMap(prof => prof.tags || []);
      const tags = [...new Set(allTags)].filter(Boolean).sort();

      return {
        universities: universities.length > 0 ? universities : this.getFallbackFilterOptions().universities,
        departments,
        researchGroups,
        researchAreas: researchAreas.length > 0 ? researchAreas : this.getFallbackResearchAreas(),
        tags: tags.length > 0 ? tags : this.getFallbackTags(),
        sortOptions: [
          { value: 'rating', label: 'Highest Rating' },
          { value: 'reviews', label: 'Most Reviews' },
          { value: 'labName', label: 'Lab Name (A-Z)' },
          { value: 'professor', label: 'Professor Name (A-Z)' },
          { value: 'university', label: 'University Name (A-Z)' }
        ]
      };
    } catch (error) {
      console.error('Error fetching filter options:', error);
      return this.getFallbackFilterOptions();
    }
  }

  // Fallback filter options when API fails
  static getFallbackFilterOptions() {
    return {
      universities: [
        'Purdue University',
        'Stanford University',
        'MIT',
        'Carnegie Mellon University',
        'UC Berkeley'
      ],
      departments: [
        'Computer Science',
        'Electrical Engineering',
        'Data Science'
      ],
      researchGroups: [
        'AI Research Group',
        'Machine Learning Lab',
        'Computer Vision Lab'
      ],
      researchAreas: this.getFallbackResearchAreas(),
      tags: this.getFallbackTags(),
      sortOptions: [
        { value: 'rating', label: 'Highest Rating' },
        { value: 'reviews', label: 'Most Reviews' },
        { value: 'labName', label: 'Lab Name (A-Z)' },
        { value: 'professor', label: 'Professor Name (A-Z)' },
        { value: 'university', label: 'University Name (A-Z)' }
      ]
    };
  }

  static getFallbackResearchAreas() {
    return [
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
    ];
  }

  static getFallbackTags() {
    return [
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
    ];
  }

  // Get available universities with IDs and names
  static async getUniversities() {
    try {
      const response = await fetch(`${API_BASE_URL}/universities/?fields=minimal`);
      if (!response.ok) {
        throw new Error(`API request failed: ${response.status}`);
      }

      const data = await response.json();
      console.log('Universities API response:', data);

      // Extract universities from paginated response
      const universities = data.results || [];
      console.log(`Loaded ${universities.length} universities:`, universities);

      // Return universities with both id and name
      return universities.map(uni => ({
        id: uni.id,
        name: uni.name
      })).sort((a, b) => a.name.localeCompare(b.name));
    } catch (error) {
      console.error('Error fetching universities:', error);
      return [];
    }
  }

  // Get departments for a specific university using university ID
  static async getDepartments(universityId) {
    try {
      const response = await fetch(`${API_BASE_URL}/universities/${universityId}/departments/?fields=minimal`);
      if (!response.ok) {
        throw new Error(`API request failed: ${response.status}`);
      }

      const departments = await response.json();
      console.log('Departments API response for university', universityId, ':', departments);

      console.log(`Loaded ${departments.length} departments for university ${universityId}:`, departments);

      // Return departments with id (university_department_id), department (department_id), and name
      return departments.map(dept => ({
        id: dept.id,
        department: dept.department,
        name: dept.name
      })).sort((a, b) => a.name.localeCompare(b.name));
    } catch (error) {
      console.error('Error fetching departments for university', universityId, ':', error);
      return [];
    }
  }

  // Get labs filtered by university and department
  static async getLabsByUniversityAndDepartment(universityName, departmentName, page = 1, pageSize = 50) {
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        page_size: pageSize.toString()
      });

      if (universityName) {
        params.append('university', universityName);
      }
      if (departmentName) {
        params.append('department', departmentName);
      }

      const response = await fetch(`${API_BASE_URL}/labs/?${params}`);
      if (!response.ok) {
        throw new Error(`API request failed: ${response.status}`);
      }

      const data = await response.json();
      return {
        results: data.results.map(lab => ({
          id: lab.id,
          labName: lab.lab_name,
          professorName: lab.professor_name,
          universityName: lab.university_name,
          department: lab.department,
          researchAreas: lab.research_areas || [],
          overallRating: parseFloat(lab.overall_rating) || 0,
          reviewCount: parseInt(lab.review_count) || 0
        })),
        total: data.count,
        page: data.page || page,
        hasMore: !!data.next
      };
    } catch (error) {
      console.error('Error fetching labs by university and department:', error);
      return { results: [], total: 0, page: 1, hasMore: false };
    }
  }

  // Get research areas filtered by department
  static async getResearchAreasByDepartment(departmentId) {
    try {
      const response = await fetch(`${API_BASE_URL}/research-areas/?department=${departmentId}&fields=minimal`);
      if (!response.ok) {
        throw new Error(`API request failed: ${response.status}`);
      }

      const data = await response.json();
      console.log('Research areas API response for department', departmentId, ':', data);

      // Extract research areas from paginated response
      const researchAreas = data.results || [];
      console.log(`Loaded ${researchAreas.length} research areas for department ${departmentId}:`, researchAreas);

      return researchAreas;
    } catch (error) {
      console.error('Error fetching research areas for department', departmentId, ':', error);
      return [];
    }
  }

  // Search research areas by name for suggestion
  static async searchResearchAreas(query) {
    try {
      const response = await fetch(`${API_BASE_URL}/research-areas/?search=${encodeURIComponent(query)}&fields=minimal`);
      if (!response.ok) {
        throw new Error(`API request failed: ${response.status}`);
      }

      const data = await response.json();
      const researchAreas = data.results || [];
      console.log(`Found ${researchAreas.length} research areas matching "${query}":`, researchAreas);

      return researchAreas;
    } catch (error) {
      console.error('Error searching research areas:', error);
      return [];
    }
  }
}