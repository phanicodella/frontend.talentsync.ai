
const InterviewDashboard = {
    props: {
        interviewResults: {
            type: Object,
            required: true
        }
    },

    data() {
        return {
            formattedResults: null,
             isExporting: false,
            isSharing: false,
            shareEmail: '',
            error: null,
            successMessage: null
        };
    },

    created() {
        this.formattedResults = window.resultsService.formatResults(this.interviewResults);
    },

    methods: {
        async exportPDF() {
            this.isExporting = true;
            this.error = null;
            try {
                await window.resultsService.generateReport(this.interviewResults._id);
                this.successMessage = 'Report downloaded successfully';
            } catch (error) {
                this.error = 'Failed to generate PDF. Please try again.';
                console.error('PDF generation failed:', error);
            } finally {
                this.isExporting = false;
                setTimeout(() => this.successMessage = null, 3000);
            }
        },

        async shareResults() {
            if (!this.shareEmail) {
                this.error = 'Please enter an email address';
                return;
            }

            this.isSharing = true;
            this.error = null;
            try {
                await window.resultsService.shareResults(
                    this.interviewResults._id, 
                    this.shareEmail
                );
                this.successMessage = 'Results shared successfully';
                this.shareEmail = '';
            } catch (error) {
                this.error = 'Failed to share results. Please try again.';
                console.error('Sharing results failed:', error);
            } finally {
                this.isSharing = false;
                setTimeout(() => this.successMessage = null, 3000);
            }
        }
    },

    template: `
        <div class="interview-dashboard card">
            <div class="card-header bg-primary text-white">
                <h3 class="mb-0">Interview Results</h3>
            </div>

            <!-- Alerts -->
            <div v-if="error" class="alert alert-danger alert-dismissible fade show m-3" role="alert">
                {{ error }}
                <button type="button" class="btn-close" @click="error = null"></button>
            </div>
            <div v-if="successMessage" class="alert alert-success alert-dismissible fade show m-3" role="alert">
                {{ successMessage }}
                <button type="button" class="btn-close" @click="successMessage = null"></button>
            </div>

            <div class="card-body">
                <!-- Candidate Information -->
                <div class="candidate-info mb-4">
                    <h4>Candidate Information</h4>
                    <div class="row">
                        <div class="col-md-6">
                            <p><strong>Name:</strong> {{ formattedResults.candidateInfo.name }}</p>
                            <p><strong>Email:</strong> {{ formattedResults.candidateInfo.email }}</p>
                        </div>
                        <div class="col-md-6">
                            <p><strong>Date:</strong> {{ formattedResults.candidateInfo.date }}</p>
                            <p><strong>Duration:</strong> {{ formattedResults.candidateInfo.duration }}</p>
                        </div>
                    </div>
                </div>

                <!-- Overall Performance -->
                <div class="performance-summary mb-4">
                    <h4>Overall Performance</h4>
                    <div class="row">
                        <div class="col-md-6">
                            <div class="score-card p-3 bg-light rounded">
                                <h5 class="mb-2">Overall Score</h5>
                                <div class="progress" style="height: 25px;">
                                    <div class="progress-bar" 
                                         :class="getScoreClass(formattedResults.performance.overallScore)"
                                         :style="{ width: formattedResults.performance.overallScore + '%' }">
                                        {{ formattedResults.performance.overallScore }}%
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="col-md-6">
                            <div class="stats p-3 bg-light rounded">
                                <p><strong>Questions Answered:</strong> {{ formattedResults.performance.questionsAnswered }}</p>
                                <p><strong>Average Response Time:</strong> {{ formattedResults.performance.averageResponseTime }}s</p>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Detailed Answers -->
                <div class="answer-details mb-4">
                    <h4>Response Analysis</h4>
                    <div class="table-responsive">
                        <table class="table">
                            <thead>
                                <tr>
                                    <th>Question</th>
                                    <th>Score</th>
                                    <th>Key Points</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr v-for="answer in formattedResults.answers" :key="answer.question">
                                    <td>{{ answer.question }}</td>
                                    <td>
                                        <div class="progress">
                                            <div class="progress-bar" 
                                                 :class="getScoreClass(answer.score)"
                                                 :style="{ width: answer.score + '%' }">
                                                {{ answer.score }}%
                                            </div>
                                        </div>
                                    </td>
                                    <td>
                                        <ul class="list-unstyled mb-0">
                                            <li v-for="point in answer.analysis.keyPoints">{{ point }}</li>
                                        </ul>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>

                <!-- Actions -->
                <div class="actions d-flex justify-content-between align-items-center">
                    <div class="export-action">
                        <button class="btn btn-primary" 
                                @click="exportPDF"
                                :disabled="isExporting">
                            {{ isExporting ? 'Generating...' : 'Export PDF' }}
                        </button>
                    </div>
                    <div class="share-action d-flex gap-2">
                        <input type="email" 
                               v-model="shareEmail" 
                               class="form-control" 
                               placeholder="Enter email to share">
                        <button class="btn btn-secondary" 
                                @click="shareResults"
                                :disabled="isSharing">
                            {{ isSharing ? 'Sharing...' : 'Share Results' }}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `
};

// Register the component globally
window.InterviewDashboard = InterviewDashboard;