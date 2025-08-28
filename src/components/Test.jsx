import React, { useState } from 'react'
import { getNearbyUsers, updateUserLocation } from '../apis/userLocations'
import { supabase } from '../supabaseClient'
import { fetchActivitiesByCategoryName, fetchCreatorByActivityId, searchActivities } from '../apis/activities'
import { loginWithOTP, verifyOTP, sendResetEmail, resetPassword } from '../apis/auth'
import { updateMood, getMoodByUserId } from '../apis/moods'
import { fillUserName } from '../apis/profiles'
import { fetchParticipantsByActivityId } from '../apis/activities_participants'
import { sendCanceledActivityNotification, sendUpdatedActivityNotification, sendStartingActivityNotification, sendQuitActivityNotification } from '../apis/notifications'
import { searchUser } from '../apis/profile_details'

export default function Test() {
  const [testResult, setTestResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [apiResponse, setApiResponse] = useState(null)
  const [requestTime, setRequestTime] = useState(null)

  const handleClick = async () => {
    try {
      setLoading(true)
      setError(null)
      setApiResponse(null)
      setTestResult(null)
      
      const startTime = performance.now()
      
      // 记录请求信息
      const requestInfo = {
        method: 'GET',
        endpoint: '/api/profile_details',
        params: { userId: 'user-id' },
        timestamp: new Date().toISOString()
      }

      // 发送请求并记录响应
      let response
      try {
        // const profileDetails = await getProfileDetails('f9eae89e-9060-4146-addb-c83069746126', 'a1bc7c76-3f9b-49e8-b780-28aa87003b35')
        // const likeResponse = await likeActivity('05aa177a-277b-4c43-8979-d5695dc1565f', '36231020-693c-4ccc-810c-8cc7f7c4135e')
        // const unlikeResponse = await unlikeActivity('05aa177a-277b-4c43-8979-d5695dc1565f', '36231020-693c-4ccc-810c-8cc7f7c4135e')
        // const activitieslikes = await getLikeCounts(['05aa177a-277b-4c43-8979-d5695dc1565f'])
        // const activitieslike = await getLikeCount('05aa177a-277b-4c43-8979-d5695dc1565f')
        // const activitiesComment = await postComment('05aa177a-277b-4c43-8979-d5695dc1565f', '36231020-693c-4ccc-810c-8cc7f7c4135e', '这是一个测试评论', { parentId: null })
        // const activitiesComment = await postComment('05aa177a-277b-4c43-8979-d5695dc1565f', '36231020-693c-4ccc-810c-8cc7f7c4135e', '这是一个测试评论的回复2', { parentId: "ccb9522c-62d5-49f1-b76b-e2ccee7cca70" })
        // const deletedComment = await deleteComment('581a3f15-1f77-45d2-973a-75b0575e6976', '36231020-693c-4ccc-810c-8cc7f7c4135e')
        // const commentsTree = await getActivityCommentsTree('05aa177a-277b-4c43-8979-d5695dc1565f')
        // const likeCommentResponse = await likeComment('ae580470-635b-4064-b80b-fa27d8819c54')
        // const unlikeCommentResponse = await unlikeComment('ae580470-635b-4064-b80b-fa27d8819c54')
        // const nearbyUsers = await getNearbyUsers({ lng: 121, lat: 31, radiusM: 50000, maxCount: 100 })
        // const updatedLocation = await updateUserLocation({ lat: 31, lng: 121, accuracyM: 50, sharing: true })
        // const fetchedActivities = await fetchActivitiesByCategoryName('Food & Dining')
        // const otp = await loginWithOTP('yukai_luo@yahoo.com')
        // const verifiedOtp = await verifyOTP('yukai_luo@yahoo.com', '827387')
        // const updatedMood = await updateMood('36231020-693c-4ccc-810c-8cc7f7c4135e', 'Bored')
        // const fetchedMood = await getMoodByUserId('36231020-693c-4cbc-810c-8cc7f7c4135e')
        // const signUpResponse = await signUp('luoyukai2@gmail.com', 'password123')
        // const fillNameResponse = await fillUserName('KIKI', 'Luo')
        // const fetchedParticipants = await fetchParticipantsByActivityId('166f0208-39f7-495f-8455-7451a0d4cc54')
        // const canceledNotification = await sendStartingActivityNotification(fetchedParticipants, '166f0208-39f7-495f-8455-7451a0d4cc54')
        // const creatorId = await fetchCreatorByActivityId('166f0208-39f7-495f-8455-7451a0d4cc54')
        // const quitNotification = await sendQuitActivityNotification(creatorId, '166f0208-39f7-495f-8455-7451a0d4cc54', '55f3e3a3-a9da-4cba-b95a-cbb7374e0b59')
        // const searchResults = await searchUser('g')
        // const searchResults = await searchActivities('g', 1, 10)
        // const resetEmailResponse = await sendResetEmail('yukai_luo@yahoo.com')
        const resetPasswordResponse = await resetPassword('654321', { reauth: true, email: 'yukai_luo@yahoo.com', currentPassword: '123456' })

        response = {
          status: 200,
          data: resetPasswordResponse,
          timestamp: new Date().toISOString()
        }
        setTestResult(resetPasswordResponse)
      } catch (err) {
        response = {
          status: err.status || 500,
          error: err.message,
          timestamp: new Date().toISOString()
        }
        throw err
      } finally {
        const endTime = performance.now()
        setRequestTime(endTime - startTime)
        setApiResponse({
          request: requestInfo,
          response: response
        })
      }
    } catch (error) {
      setError(error.message)
      console.error('Error fetching profile details:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="test-container">
      <h2>API 测试面板</h2>
      <div className="test-content">
        <div className="test-box">
          <h3>Profile Details 测试</h3>
          <button 
            className="test-button" 
            onClick={handleClick}
            disabled={loading}
          >
            {loading ? '测试中...' : '开始测试'}
          </button>

          <div className="test-results">
            {loading && (
              <div className="test-status loading">
                正在获取数据...
              </div>
            )}
            
            {error && (
              <div className="test-status error">
                <h4>测试失败</h4>
                <p>{error}</p>
              </div>
            )}

            {apiResponse && (
              <div className={`test-status ${error ? 'error' : 'info'}`}>
                <h4>API 请求详情</h4>
                {requestTime && (
                  <div className="response-time">
                    响应时间: {requestTime.toFixed(2)}ms
                  </div>
                )}
                <div className="api-details">
                  <div className="request-info">
                    <h5>请求信息</h5>
                    <div className="result-data">
                      <pre>{JSON.stringify(apiResponse.request, null, 2)}</pre>
                    </div>
                  </div>
                  <div className="response-info">
                    <h5>响应信息</h5>
                    <div className="result-data">
                      <pre>{JSON.stringify(apiResponse.response, null, 2)}</pre>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {testResult && !error && (
              <div className="test-status success">
                <h4>测试结果</h4>
                <div className="result-data">
                  <pre>{JSON.stringify(testResult, null, 2)}</pre>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
