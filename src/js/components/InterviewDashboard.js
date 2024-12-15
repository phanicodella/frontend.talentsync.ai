// frontend/src/js/components/InterviewDashboard.js
const InterviewDashboard = {
  props: {
      interviewResults: {
          type: Object,
          required: true
      }
  },

  data() {
      return {
          errorMessage: null,
          isExporting: false
      };
  },

  computed: {
      overallScore() {
          if (!this.interviewResults?.answers?.length) return 0;
          const scores = this.interviewResults.answers.map(answer => 
              (answer.analysis.clarity + answer.analysis.relevance + answer.analysis.confidence) / 3
          );
          return Math.round((scores.reduce((a, b) => a + b) / scores.length) * 10);
      },

      formattedDate() {
          return new Date(this.interviewResults.startTime).toLocaleString();
      },

      totalDuration() {
          if (!this.interviewResults.startTime || !this.interviewResults.endTime) return 0;
          return Math.round((new Date(this.interviewResults.endTime) - new Date(this.interviewResults.startTime)) / 1000);
      }
  },

  methods: {
      getScoreClass(score) {
          if (score >= 80) return 'bg-success';
          if (score >= 60) return 'bg-info';
          if (score >= 40) return 'bg-warning';
          return 'bg-danger';
      },

      formatDuration(seconds) {
          const minutes = Math.floor(seconds / 60);
          const remainingSeconds = seconds % 60;
          return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
      },

      async exportPDF() {
          this.isExporting = true;
          try {
              const response = await fetch(`${window.CONFIG.API_BASE_URL}/interviews/${this.interviewResults._id}/export-pdf`, {
                  method: 'POST'
              });
              
              if (!response.ok) throw new Error('Export failed');
              
              const blob = await response.blob();
              const url = window.URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = `interview-results-${this.interviewResults._id}.pdf`;
              document.body.appendChild(a);
              a.click();
              window.URL.revokeObjectURL(url);
              document.body.removeChild(a);
          } catch (error) {
              this.errorMessage = 'Failed to export PDF. Please try again.';
              setTimeout(() => this.errorMessage = null, 3000);
          } finally {
              this.isExporting = false;
          }
      },

      async shareResults() {
          if (!this.interviewResults?.candidate?.email) {
              this.errorMessage = 'No email address available';
              setTimeout(() => this.errorMessage = null, 3000);
              return;
          }

          try {
              const response = await fetch(`${window.CONFIG.API_BASE_URL}/interviews/${this.interviewResults._id}/share`, {
                  method: 'POST',
                  headers: {
                      'Content-Type': 'application/json'
                  },
                  body: JSON.stringify({
                      email: this.interviewResults.candidate.email
                  })
              });

              if (!response.ok) throw new Error('Failed to share results');
              
              alert('Results have been shared successfully!');
          } catch (error) {
              this.errorMessage = 'Failed to share results. Please try again.';
              setTimeout(() => this.errorMessage = null, 3000);
          }
      }
  },

  template: `
      <div class="interview-results p-4">
          <div v-if="errorMessage" class="alert alert-danger">{{ errorMessage }}</div>
          
          <div class="card">
              <div class="card-header bg-primary text-white">
                  <h3 class="m-0">Interview Results</h3>
              </div>
              
              <div class="card-body">
                  <div class="row mb-4">
                      <div class="col-md-6">
                          <h4>Candidate Information</h4>
                          <p><strong>Name:</strong> {{ interviewResults.candidateName }}</p>
                          <p><strong>Email:</strong> {{ interviewResults.candidate }}</p>
                          <p><strong>Interview Date:</strong> {{ formattedDate }}</p>
                          <p><strong>Duration:</strong> {{ formatDuration(totalDuration) }}</p>
                      </div>
                      
                      <div class="col-md-6">
                          <h4>Overall Performance</h4>
                          <div class="progress mb-3" style="height: 30px">
                              <div class="progress-bar" 
                                   :class="getScoreClass(overallScore)"
                                   :style="{ width: overallScore + '%' }">
                                  {{ overallScore }}%
                              </div>
                          </div>
                      </div>
                  </div>

                  <div class="table-responsive mb-4">
                      <table class="table table-bordered">
                          <thead class="table-light">
                              <tr>
                                  <th>Question</th>
                                  <th>Score</th>
                                  <th>Duration</th>
                              </tr>
                          </thead>
                          <tbody>
                              <tr v-for="answer in interviewResults.answers" :key="answer.question">
                                  <td>{{ answer.question }}</td>
                                  <td>
                                      <div class="progress">
                                          <div class="progress-bar" 
                                               :class="getScoreClass((answer.analysis.clarity + answer.analysis.relevance + answer.analysis.confidence) / 3 * 10)"
                                               :style="{ width: ((answer.analysis.clarity + answer.analysis.relevance + answer.analysis.confidence) / 3 * 10) + '%' }">
                                              {{ Math.round((answer.analysis.clarity + answer.analysis.relevance + answer.analysis.confidence) / 3 * 10) }}%
                                          </div>
                                      </div>
                                  </td>
                                  <td>{{ formatDuration(answer.duration) }}</td>
                              </tr>
                          </tbody>
                      </table>
                  </div>

                  <div class="row mb-4">
                      <div class="col-md-6">
                          <h4>Strengths</h4>
                          <ul class="list-group">
                              <li v-for="strength in interviewResults.feedback?.strengths" 
                                  class="list-group-item text-success">
                                  <i class="bi bi-check-circle me-2"></i>
                                  {{ strength }}
                              </li>
                          </ul>
                      </div>
                      
                      <div class="col-md-6">
                          <h4>Areas for Improvement</h4>
                          <ul class="list-group">
                              <li v-for="improvement in interviewResults.feedback?.improvements" 
                                  class="list-group-item text-primary">
                                  <i class="bi bi-arrow-up-circle me-2"></i>
                                  {{ improvement }}
                              </li>
                          </ul>
                      </div>
                  </div>

                  <div class="feedback-section mb-4">
                      <h4>Detailed Feedback</h4>
                      <div class="card">
                          <div class="card-body">
                              {{ interviewResults.feedback?.aiAnalysis }}
                          </div>
                      </div>
                  </div>

                  <div class="d-flex justify-content-center gap-3">
                      <button @click="exportPDF" 
                              class="btn btn-primary" 
                              :disabled="isExporting">
                          {{ isExporting ? 'Exporting...' : 'Export PDF' }}
                      </button>
                      <button @click="shareResults" 
                              class="btn btn-secondary">
                          Share Results
                      </button>
                  </div>
              </div>
          </div>
      </div>
  `
};

window.InterviewDashboard = InterviewDashboard;