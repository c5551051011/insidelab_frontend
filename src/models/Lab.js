// Lab Model - Data model for lab entities
export class Lab {
  constructor(data) {
    this.id = data.id;
    this.labName = data.labName || data.lab_name || '';
    this.professorName = data.professorName || data.professor_name || '';
    this.universityName = data.universityName || data.university_name || '';
    this.department = data.department || '';
    this.researchGroup = data.researchGroup || data.research_group || '';
    this.overallRating = data.overallRating || data.overall_rating || 0;
    this.reviewCount = data.reviewCount || data.review_count || 0;
    this.researchAreas = data.researchAreas || data.research_areas || [];
    this.tags = data.tags || [];
    this.recruitmentStatus = new RecruitmentStatus(data.recruitmentStatus || data.recruitment_status || {});
    this.description = data.description || '';
    this.website = data.website || '';
    this.email = data.email || '';
    this.location = data.location || '';
    this.ratingBreakdown = data.ratingBreakdown || data.rating_breakdown || null;
    this.createdAt = data.createdAt || data.created_at || null;
    this.updatedAt = data.updatedAt || data.updated_at || null;
  }

  // Get lab initials for avatar
  getInitials() {
    const words = this.labName.split(' ');
    if (words.length >= 2) {
      return words[0][0] + words[1][0];
    }
    return this.labName.substring(0, 2);
  }

  // Get formatted rating
  getFormattedRating(decimals = 1) {
    return this.overallRating.toFixed(decimals);
  }

  // Get review count text
  getReviewCountText() {
    if (this.reviewCount === 0) return 'No reviews';
    if (this.reviewCount === 1) return '1 review';
    return `${this.reviewCount} reviews`;
  }

  // Check if lab matches search query
  matchesQuery(query) {
    if (!query || !query.trim()) return true;

    const searchTerms = query.toLowerCase().trim();
    const searchableFields = [
      this.labName,
      this.professorName,
      this.universityName,
      this.department,
      this.description,
      ...this.researchAreas,
      ...this.tags
    ];

    return searchableFields.some(field =>
      field && field.toLowerCase().includes(searchTerms)
    );
  }

  // Check if lab has specific research area
  hasResearchArea(area) {
    return this.researchAreas.some(
      researchArea => researchArea.toLowerCase() === area.toLowerCase()
    );
  }

  // Check if lab has specific tag
  hasTag(tag) {
    return this.tags.some(
      labTag => labTag.toLowerCase() === tag.toLowerCase()
    );
  }

  // Get recruitment status chips
  getRecruitmentChips() {
    const chips = [];
    if (this.recruitmentStatus.phd) chips.push({ type: 'phd', label: 'PhD' });
    if (this.recruitmentStatus.postdoc) chips.push({ type: 'postdoc', label: 'PostDoc' });
    if (this.recruitmentStatus.intern) chips.push({ type: 'intern', label: 'Intern' });
    return chips;
  }

  // Check if lab is currently recruiting
  isRecruiting() {
    return this.recruitmentStatus.phd ||
           this.recruitmentStatus.postdoc ||
           this.recruitmentStatus.intern;
  }

  // Get full hierarchy string
  getHierarchy() {
    return `${this.department} > ${this.researchGroup}`;
  }

  // Validate required fields
  isValid() {
    return this.id &&
           this.labName &&
           this.professorName &&
           this.universityName;
  }

  // Convert to plain object (for API calls)
  toJSON() {
    return {
      id: this.id,
      labName: this.labName,
      professorName: this.professorName,
      universityName: this.universityName,
      department: this.department,
      researchGroup: this.researchGroup,
      overallRating: this.overallRating,
      reviewCount: this.reviewCount,
      researchAreas: this.researchAreas,
      tags: this.tags,
      recruitmentStatus: this.recruitmentStatus.toJSON(),
      description: this.description,
      website: this.website,
      email: this.email,
      location: this.location,
      ratingBreakdown: this.ratingBreakdown
    };
  }

  // Create from API response
  static fromAPI(apiData) {
    return new Lab(apiData);
  }

  // Create multiple labs from API response
  static fromAPIList(apiDataList) {
    return apiDataList.map(data => Lab.fromAPI(data));
  }
}

// Recruitment Status Model
export class RecruitmentStatus {
  constructor(data = {}) {
    this.phd = data.phd || false;
    this.postdoc = data.postdoc || false;
    this.intern = data.intern || false;
    this.notes = data.notes || '';
    this.lastUpdated = data.lastUpdated || data.last_updated || null;
  }

  // Check if any recruitment is active
  hasActiveRecruitment() {
    return this.phd || this.postdoc || this.intern;
  }

  // Get active recruitment types
  getActiveTypes() {
    const active = [];
    if (this.phd) active.push('PhD');
    if (this.postdoc) active.push('PostDoc');
    if (this.intern) active.push('Intern');
    return active;
  }

  // Get recruitment summary text
  getSummary() {
    const active = this.getActiveTypes();
    if (active.length === 0) return 'Not recruiting';
    if (active.length === 1) return `Recruiting ${active[0]}`;
    if (active.length === 2) return `Recruiting ${active.join(' and ')}`;
    return `Recruiting ${active.slice(0, -1).join(', ')} and ${active[active.length - 1]}`;
  }

  // Convert to plain object
  toJSON() {
    return {
      phd: this.phd,
      postdoc: this.postdoc,
      intern: this.intern,
      notes: this.notes,
      lastUpdated: this.lastUpdated
    };
  }
}

// Search Filter Model
export class SearchFilter {
  constructor(data = {}) {
    this.rating = data.rating || 0;
    this.universities = data.universities || [];
    this.researchAreas = data.researchAreas || [];
    this.tags = data.tags || [];
    this.sortBy = data.sortBy || 'rating';
    this.recruitmentOnly = data.recruitmentOnly || false;
  }

  // Check if any filters are active
  hasActiveFilters() {
    return this.rating > 0 ||
           this.universities.length > 0 ||
           this.researchAreas.length > 0 ||
           this.tags.length > 0 ||
           this.recruitmentOnly;
  }

  // Get active filter count
  getActiveFilterCount() {
    let count = 0;
    if (this.rating > 0) count++;
    if (this.universities.length > 0) count++;
    if (this.researchAreas.length > 0) count++;
    if (this.tags.length > 0) count++;
    if (this.recruitmentOnly) count++;
    return count;
  }

  // Clear all filters
  clear() {
    this.rating = 0;
    this.universities = [];
    this.researchAreas = [];
    this.tags = [];
    this.recruitmentOnly = false;
    // Keep sortBy unchanged
  }

  // Apply filter to lab
  applyToLab(lab) {
    // Rating filter
    if (this.rating > 0 && lab.overallRating < this.rating) {
      return false;
    }

    // University filter
    if (this.universities.length > 0 && !this.universities.includes(lab.universityName)) {
      return false;
    }

    // Research areas filter
    if (this.researchAreas.length > 0) {
      const hasMatchingArea = this.researchAreas.some(area =>
        lab.hasResearchArea(area)
      );
      if (!hasMatchingArea) return false;
    }

    // Tags filter
    if (this.tags.length > 0) {
      const hasMatchingTag = this.tags.some(tag =>
        lab.hasTag(tag)
      );
      if (!hasMatchingTag) return false;
    }

    // Recruitment filter
    if (this.recruitmentOnly && !lab.isRecruiting()) {
      return false;
    }

    return true;
  }

  // Convert to query parameters for API
  toQueryParams() {
    const params = {};

    if (this.rating > 0) params.min_rating = this.rating;
    if (this.universities.length > 0) params.universities = this.universities.join(',');
    if (this.researchAreas.length > 0) params.research_areas = this.researchAreas.join(',');
    if (this.tags.length > 0) params.tags = this.tags.join(',');
    if (this.sortBy) params.sort_by = this.sortBy;
    if (this.recruitmentOnly) params.recruiting_only = true;

    return params;
  }

  // Create from query parameters
  static fromQueryParams(params) {
    return new SearchFilter({
      rating: parseFloat(params.min_rating) || 0,
      universities: params.universities ? params.universities.split(',') : [],
      researchAreas: params.research_areas ? params.research_areas.split(',') : [],
      tags: params.tags ? params.tags.split(',') : [],
      sortBy: params.sort_by || 'rating',
      recruitmentOnly: params.recruiting_only === 'true'
    });
  }

  // Convert to plain object
  toJSON() {
    return {
      rating: this.rating,
      universities: this.universities,
      researchAreas: this.researchAreas,
      tags: this.tags,
      sortBy: this.sortBy,
      recruitmentOnly: this.recruitmentOnly
    };
  }
}