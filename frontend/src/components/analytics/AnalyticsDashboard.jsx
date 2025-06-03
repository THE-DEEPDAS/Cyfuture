import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faUsers,
  faCheckCircle,
  faTimesCircle,
  faChartLine,
  faLanguage,
  faBuilding,
} from "@fortawesome/free-solid-svg-icons";
import { getJobAnalytics } from "../../actions/analyticsActions";
import DashboardCard from "../common/DashboardCard";
import Message from "../common/Message";
import Loader from "../common/Loader";

const AnalyticsDashboard = () => {
  const dispatch = useDispatch();
  const [timeRange, setTimeRange] = useState("month");
  const [selectedJob, setSelectedJob] = useState("all");

  const analytics = useSelector((state) => state.analytics);
  const { loading, error, data } = analytics;

  useEffect(() => {
    dispatch(getJobAnalytics({ timeRange, jobId: selectedJob }));
  }, [dispatch, timeRange, selectedJob]);

  const renderTrendIndicator = (value, previousValue) => {
    const percentChange = previousValue
      ? ((value - previousValue) / previousValue) * 100
      : 0;

    return {
      trend: percentChange > 0 ? "up" : "down",
      percentage: Math.abs(Math.round(percentChange)),
    };
  };

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex flex-wrap gap-4 items-center justify-between">
        <div className="flex gap-4">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          >
            <option value="week">Last 7 Days</option>
            <option value="month">Last 30 Days</option>
            <option value="quarter">Last 3 Months</option>
            <option value="year">Last 12 Months</option>
          </select>

          <select
            value={selectedJob}
            onChange={(e) => setSelectedJob(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          >
            <option value="all">All Jobs</option>
            {data?.jobs?.map((job) => (
              <option key={job._id} value={job._id}>
                {job.title}
              </option>
            ))}
          </select>
        </div>

        <button
          onClick={() =>
            dispatch(getJobAnalytics({ timeRange, jobId: selectedJob }))
          }
          className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
        >
          <FontAwesomeIcon icon="sync" className="mr-2" />
          Refresh
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center">
          <Loader />
        </div>
      ) : error ? (
        <Message variant="error">{error}</Message>
      ) : data ? (
        <div className="space-y-6">
          {/* Overview Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <DashboardCard
              title="Total Applications"
              value={data.totalApplications}
              icon={faUsers}
              color="primary"
              percentage={renderTrendIndicator(
                data.totalApplications,
                data.previousPeriod?.totalApplications
              )}
            />

            <DashboardCard
              title="Shortlisted"
              value={data.shortlistedCandidates}
              icon={faCheckCircle}
              color="success"
              percentage={renderTrendIndicator(
                data.shortlistedCandidates,
                data.previousPeriod?.shortlistedCandidates
              )}
            />

            <DashboardCard
              title="Rejected"
              value={data.rejectedCandidates}
              icon={faTimesCircle}
              color="danger"
              percentage={renderTrendIndicator(
                data.rejectedCandidates,
                data.previousPeriod?.rejectedCandidates
              )}
            />

            <DashboardCard
              title="Active Jobs"
              value={data.activeJobs}
              icon={faBuilding}
              color="info"
            />
          </div>

          {/* LLM Analysis Stats */}
          <div className="bg-white rounded-xl shadow-soft p-6 space-y-6">
            <h3 className="text-lg font-semibold mb-4">
              LLM Analysis Insights
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-medium">Language Distribution</h4>
                  <FontAwesomeIcon
                    icon={faLanguage}
                    className="text-primary-600"
                  />
                </div>
                <div className="space-y-2">
                  {Object.entries(data.languageStats || {}).map(
                    ([lang, count]) => (
                      <div
                        key={lang}
                        className="flex justify-between items-center"
                      >
                        <span className="text-gray-600">{lang}</span>
                        <span className="font-medium">{count}</span>
                      </div>
                    )
                  )}
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-medium">Average Match Scores</h4>
                  <FontAwesomeIcon
                    icon={faChartLine}
                    className="text-primary-600"
                  />
                </div>
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-600">Skills Match</span>
                      <span className="font-medium">
                        {Math.round(data.averageScores?.skills || 0)}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-primary-600 h-2 rounded-full"
                        style={{
                          width: `${Math.round(
                            data.averageScores?.skills || 0
                          )}%`,
                        }}
                      ></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-600">Experience Match</span>
                      <span className="font-medium">
                        {Math.round(data.averageScores?.experience || 0)}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-green-600 h-2 rounded-full"
                        style={{
                          width: `${Math.round(
                            data.averageScores?.experience || 0
                          )}%`,
                        }}
                      ></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-600">Overall Match</span>
                      <span className="font-medium">
                        {Math.round(data.averageScores?.total || 0)}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full"
                        style={{
                          width: `${Math.round(
                            data.averageScores?.total || 0
                          )}%`,
                        }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-medium">Common Selection Factors</h4>
                  <FontAwesomeIcon
                    icon="list-check"
                    className="text-primary-600"
                  />
                </div>
                <ul className="space-y-2">
                  {data.commonFactors?.map((factor, index) => (
                    <li key={index} className="flex items-start">
                      <span className="text-primary-600 mr-2">•</span>
                      <span className="text-gray-600 text-sm">{factor}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* Job-specific Stats */}
          {selectedJob !== "all" && data.jobSpecific && (
            <div className="bg-white rounded-xl shadow-soft p-6">
              <h3 className="text-lg font-semibold mb-4">
                Job-Specific Analytics
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="space-y-4">
                  <h4 className="font-medium">
                    Application Status Distribution
                  </h4>
                  {Object.entries(
                    data.jobSpecific.statusDistribution || {}
                  ).map(([status, count]) => (
                    <div
                      key={status}
                      className="flex justify-between items-center"
                    >
                      <span className="text-gray-600">{status}</span>
                      <span className="font-medium">{count}</span>
                    </div>
                  ))}
                </div>

                <div className="space-y-4">
                  <h4 className="font-medium">Top Required Skills Match</h4>
                  {data.jobSpecific.skillsMatchDistribution?.map((skill) => (
                    <div key={skill.name} className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">{skill.name}</span>
                        <span className="font-medium">
                          {skill.matchPercentage}%
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-primary-600 h-2 rounded-full"
                          style={{ width: `${skill.matchPercentage}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="space-y-4">
                  <h4 className="font-medium">Response Times</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">
                        Average Time to Shortlist
                      </span>
                      <span className="font-medium">
                        {data.jobSpecific.averageTimeToShortlist} days
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">
                        Average Response Time
                      </span>
                      <span className="font-medium">
                        {data.jobSpecific.averageResponseTime} hours
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Hiring Funnel */}
          <div className="bg-white rounded-xl shadow-soft p-6">
            <h3 className="text-lg font-semibold mb-4">Hiring Funnel</h3>
            <div className="relative pt-1">
              {data.hiringFunnel?.map((stage, index) => (
                <div key={index} className="mb-4">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm font-medium text-gray-700">
                      {stage.label}
                    </span>
                    <span className="text-sm font-medium text-gray-900">
                      {stage.value}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div
                      className={`${
                        index === 0
                          ? "bg-blue-500"
                          : index === 1
                          ? "bg-indigo-500"
                          : index === 2
                          ? "bg-purple-500"
                          : index === 3
                          ? "bg-green-500"
                          : "bg-emerald-500"
                      } h-2.5 rounded-full transition-all duration-500`}
                      style={{
                        width: `${
                          (stage.value / data.totalApplications) * 100 || 0
                        }%`,
                      }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Time-to-Hire Metrics */}
          <div className="bg-white rounded-xl shadow-soft p-6">
            <h3 className="text-lg font-semibold mb-4">Time-to-Hire Metrics</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-medium mb-2">Average Time to Hire</h4>
                <div className="flex items-baseline">
                  <span className="text-2xl font-bold text-primary-600">
                    {data.timeToHireMetrics?.average || 0}
                  </span>
                  <span className="ml-2 text-gray-600">days</span>
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-medium mb-2">Time in Each Stage</h4>
                <div className="space-y-2">
                  {Object.entries(data.timeToHireMetrics?.stages || {}).map(
                    ([stage, days]) => (
                      <div
                        key={stage}
                        className="flex justify-between items-center"
                      >
                        <span className="text-gray-600">{stage}</span>
                        <span className="font-medium">{days} days</span>
                      </div>
                    )
                  )}
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-medium mb-2">Bottlenecks</h4>
                <div className="space-y-2">
                  {data.timeToHireMetrics?.bottlenecks?.map(
                    (bottleneck, index) => (
                      <div key={index} className="text-sm">
                        <span
                          className={`inline-block w-2 h-2 rounded-full mr-2 ${
                            bottleneck.severity === "high"
                              ? "bg-red-500"
                              : bottleneck.severity === "medium"
                              ? "bg-yellow-500"
                              : "bg-green-500"
                          }`}
                        ></span>
                        {bottleneck.stage}: {bottleneck.description}
                      </div>
                    )
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Source Analysis */}
          <div className="bg-white rounded-xl shadow-soft p-6">
            <h3 className="text-lg font-semibold mb-4">Candidate Sources</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium mb-3">Application Sources</h4>
                <div className="space-y-3">
                  {Object.entries(
                    data.sourceAnalytics?.applicationSources || {}
                  ).map(([source, count]) => (
                    <div key={source} className="relative">
                      <div className="flex justify-between mb-1">
                        <span className="text-sm font-medium text-gray-600">
                          {source}
                        </span>
                        <span className="text-sm font-medium text-gray-900">
                          {count}
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-primary-600 h-2 rounded-full"
                          style={{
                            width: `${
                              (count / data.totalApplications) * 100 || 0
                            }%`,
                          }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="font-medium mb-3">Quality by Source</h4>
                <div className="space-y-3">
                  {Object.entries(
                    data.sourceAnalytics?.qualityBySource || {}
                  ).map(([source, score]) => (
                    <div key={source} className="relative">
                      <div className="flex justify-between mb-1">
                        <span className="text-sm font-medium text-gray-600">
                          {source}
                        </span>
                        <span className="text-sm font-medium text-gray-900">
                          {score}%
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-green-600 h-2 rounded-full"
                          style={{ width: `${score}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default AnalyticsDashboard;
