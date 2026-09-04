import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

import type { ApprovalRequest, Challenge } from '../types';
import { useAuth } from './AuthContext';

export interface NewChallengeInput {
  title: string;
  description: string;
  domain: string;
  country: string;
  state: string;
  district: string;
  city: string;
  pincode: string;
  latitude?: number;
  longitude?: number;
  locationAccuracy?: number;
  mediaUrl?: string;
  mediaType?: 'image' | 'video';
}

interface ChallengeValue {
  all: Challenge[];
  duplicateCheck: (
    input: {
      title: string;
      description: string;
      state: string;
      district: string;
    }
  ) => Promise<{
    duplicateChallenge?: Challenge | null;
    similarity?: number;
  }>;

  mine: Challenge[];
  ready: boolean;

  getById: (id: string) => Challenge | undefined;

  addChallenge: (
    input: NewChallengeInput
  ) => Promise<Challenge>;

  claimForTeam: (
    id: string,
    teamName: string,
    solution: {
      title: string;
      description: string;
    }
  ) => Promise<Challenge>;

  submitSolution: (
    id: string,
    title: string,
    description: string
  ) => Promise<Challenge>;

  postProgress: (
    id: string,
    note: string
  ) => Promise<Challenge>;

  expressIndustryInterest: (
    id: string
  ) => Promise<Challenge>;

  sendProposal: (
    id: string,
    data: {
      idea: string;
      offer?: string;
      bid?: string;
    }
  ) => Promise<Challenge>;

  respondProposal: (
    id: string,
    proposalId: string,
    decision: 'accept' | 'reject',
    note?: string
  ) => Promise<Challenge>;

  submitCompletion: (
    id: string,
    summary: string,
    proofs: string[],
    beforeMedia?: {
      url: string;
      type: 'image' | 'video';
    },
    afterMedia?: {
      url: string;
      type: 'image' | 'video';
    }
  ) => Promise<Challenge>;

  aiSuggestion: (
    input: {
      title: string;
      description: string;
      domain: string;
    }
  ) => Promise<any>;

  universityLeaderboard: () => Promise<any[]>;

  supportChallenge: (
    id: string
  ) => Promise<Challenge>;

  requestVerification: (
    id: string
  ) => Promise<ApprovalRequest>;

  approve: (
    id: string
  ) => Promise<Challenge>;

  reject: (
    id: string
  ) => Promise<Challenge>;

  approvalRequests: ApprovalRequest[];

  pendingApprovalCount: number;

  approveRequest: (
    id: string
  ) => Promise<ApprovalRequest>;

  rejectRequest: (
    id: string
  ) => Promise<ApprovalRequest>;

  deleteChallenge: (
    id: string
  ) => Promise<void>;

  deleteApprovalRequest: (
    id: string
  ) => Promise<void>;

  adminUsers: () => Promise<any[]>;

  deleteUser: (
    id: string
  ) => Promise<void>;
}

const C = createContext<ChallengeValue | null>(null);

const headers = () => {
  const token =
    localStorage.getItem('samadhan-token') || '';

  return {
    'Content-Type': 'application/json',
    ...(token
      ? {
          Authorization: `Bearer ${token}`,
        }
      : {}),
  };
};

async function request(
  url: string,
  options: RequestInit = {}
) {
  const response = await fetch(url, options);

  const data = await response
    .json()
    .catch(() => ({}));

  if (!response.ok) {
    throw new Error(
      data.error || 'Request failed'
    );
  }

  return data;
}

export function ChallengeProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user } = useAuth();

  const [all, setAll] = useState<Challenge[]>([]);
  const [approvalRequests, setApprovalRequests] =
    useState<ApprovalRequest[]>([]);
  const [ready, setReady] = useState(false);

  const refresh = useCallback(async () => {
    try {
      const challenges = await request(
        '/api/challenges',
        {
          headers: headers(),
        }
      );

      setAll(challenges);

      if (user?.role === 'admin') {
        const requests = await request(
          '/api/approval-requests',
          {
            headers: headers(),
          }
        );

        setApprovalRequests(requests);
      }
    } finally {
      setReady(true);
    }
  }, [user]);

  useEffect(() => {
    void refresh();

    const eventSource =
      new EventSource('/api/events');

    eventSource.onmessage = () => {
      void refresh();
    };

    return () => {
      eventSource.close();
    };
  }, [refresh]);

  const updateLocal = (challenge: Challenge) => {
    setAll((previous) =>
      previous.map((item) =>
        item.id === challenge.id
          ? challenge
          : item
      )
    );

    return challenge;
  };

  const duplicateCheck = useCallback(
    async (input: {
      title: string;
      description: string;
      state: string;
      district: string;
    }) => {
      return request(
        '/api/challenges/check-duplicate',
        {
          method: 'POST',
          headers: headers(),
          body: JSON.stringify(input),
        }
      );
    },
    []
  );

  const addChallenge = useCallback(
    async (input: NewChallengeInput) => {
      const challenge = await request(
        '/api/challenges',
        {
          method: 'POST',
          headers: headers(),
          body: JSON.stringify(input),
        }
      );

      setAll((previous) => [
        challenge,
        ...previous.filter(
          (item) => item.id !== challenge.id
        ),
      ]);

      return challenge;
    },
    []
  );

  /*
   * IMPORTANT FIX:
   *
   * Backend expects:
   *   solutionTitle
   *   solutionDescription
   *
   * Earlier frontend was sending:
   *   title
   *   description
   *
   * That caused the backend to think that no solution
   * was submitted even though the university had filled
   * both fields.
   */
  const claimForTeam = useCallback(
    async (
      id: string,
      teamName: string,
      solution: {
        title: string;
        description: string;
      }
    ) => {
      const challenge = await request(
        `/api/challenges/${id}/claim`,
        {
          method: 'POST',
          headers: headers(),
          body: JSON.stringify({
            teamName,
            solutionTitle: solution.title,
            solutionDescription:
              solution.description,
          }),
        }
      );

      return updateLocal(challenge.challenge);
    },
    []
  );

  const submitSolution = useCallback(
    async (
      id: string,
      title: string,
      description: string
    ) => {
      const data = await request(
        `/api/challenges/${id}/solution`,
        {
          method: 'POST',
          headers: headers(),
          body: JSON.stringify({
            title,
            description,
          }),
        }
      );

      return updateLocal(data.challenge);
    },
    []
  );

  const postProgress = useCallback(
    async (
      id: string,
      note: string
    ) => {
      const challenge = await request(
        `/api/challenges/${id}/progress`,
        {
          method: 'POST',
          headers: headers(),
          body: JSON.stringify({
            note,
          }),
        }
      );

      return updateLocal(challenge);
    },
    []
  );

  const expressIndustryInterest =
    useCallback(
      async (id: string) => {
        const data = await request(
          `/api/challenges/${id}/industry-interest`,
          {
            method: 'POST',
            headers: headers(),
          }
        );

        return updateLocal(data.challenge);
      },
      []
    );

  const sendProposal = useCallback(
    async (
      id: string,
      data: {
        idea: string;
        offer?: string;
        bid?: string;
      }
    ) => {
      const challenge = await request(
        `/api/challenges/${id}/proposals`,
        {
          method: 'POST',
          headers: headers(),
          body: JSON.stringify(data),
        }
      );

      return updateLocal(challenge);
    },
    []
  );

  const respondProposal = useCallback(
    async (
      id: string,
      proposalId: string,
      decision: 'accept' | 'reject',
      note?: string
    ) => {
      const challenge = await request(
        `/api/challenges/${id}/proposals/${proposalId}/respond`,
        {
          method: 'POST',
          headers: headers(),
          body: JSON.stringify({
            decision,
            note,
          }),
        }
      );

      return updateLocal(challenge);
    },
    []
  );

  const submitCompletion = useCallback(
    async (
      id: string,
      summary: string,
      proofs: string[],
      beforeMedia?: {
        url: string;
        type: 'image' | 'video';
      },
      afterMedia?: {
        url: string;
        type: 'image' | 'video';
      }
    ) => {
      const data = await request(
        `/api/challenges/${id}/completion`,
        {
          method: 'POST',
          headers: headers(),
          body: JSON.stringify({
            summary,
            proofs,
            beforeMedia,
            afterMedia,
          }),
        }
      );

      return updateLocal(data.challenge);
    },
    []
  );

  const aiSuggestion = useCallback(
    async (input: {
      title: string;
      description: string;
      domain: string;
    }) => {
      return request(
        '/api/ai/solution-suggestion',
        {
          method: 'POST',
          headers: headers(),
          body: JSON.stringify(input),
        }
      );
    },
    []
  );

  const universityLeaderboard =
    useCallback(async () => {
      return request(
        '/api/leaderboard/universities'
      );
    }, []);

  const supportChallenge = useCallback(
    async (id: string) => {
      const challenge = await request(
        `/api/challenges/${id}/support`,
        {
          method: 'POST',
          headers: headers(),
        }
      );

      return updateLocal(challenge);
    },
    []
  );

  const requestVerification =
    useCallback(
      async (id: string) => {
        const data = await request(
          `/api/challenges/${id}/verify-request`,
          {
            method: 'POST',
            headers: headers(),
          }
        );

        updateLocal(data.challenge);

        return data.request;
      },
      []
    );

  const approveRequest = useCallback(
    async (id: string) => {
      const data = await request(
        `/api/admin/approval-requests/${id}/approve`,
        {
          method: 'POST',
          headers: headers(),
        }
      );

      setApprovalRequests((previous) =>
        previous.map((request) =>
          request.id === id
            ? data.request
            : request
        )
      );

      if (data.challenge) {
        updateLocal(data.challenge);
      }

      return data.request;
    },
    []
  );

  const rejectRequest = useCallback(
    async (id: string) => {
      const data = await request(
        `/api/admin/approval-requests/${id}/reject`,
        {
          method: 'POST',
          headers: headers(),
        }
      );

      setApprovalRequests((previous) =>
        previous.map((request) =>
          request.id === id
            ? data.request
            : request
        )
      );

      if (data.challenge) {
        updateLocal(data.challenge);
      }

      return data.request;
    },
    []
  );

  const deleteChallenge = useCallback(
    async (id: string) => {
      await request(
        `/api/admin/challenges/${id}`,
        {
          method: 'DELETE',
          headers: headers(),
        }
      );

      setAll((previous) =>
        previous.filter(
          (challenge) =>
            challenge.id !== id
        )
      );

      setApprovalRequests((previous) =>
        previous.filter(
          (request) =>
            request.challengeId !== id
        )
      );
    },
    []
  );

  const deleteApprovalRequest =
    useCallback(
      async (id: string) => {
        await request(
          `/api/admin/approval-requests/${id}`,
          {
            method: 'DELETE',
            headers: headers(),
          }
        );

        setApprovalRequests((previous) =>
          previous.filter(
            (request) =>
              request.id !== id
          )
        );
      },
      []
    );

  const adminUsers = useCallback(
    async () => {
      return request(
        '/api/admin/users',
        {
          headers: headers(),
        }
      );
    },
    []
  );

  const deleteUser = useCallback(
    async (id: string) => {
      await request(
        `/api/admin/users/${id}`,
        {
          method: 'DELETE',
          headers: headers(),
        }
      );
    },
    []
  );

  const approve = useCallback(
    async (id: string) => {
      const challenge = await request(
        `/api/admin/challenges/${id}/approve`,
        {
          method: 'POST',
          headers: headers(),
        }
      );

      return updateLocal(challenge);
    },
    []
  );

  const reject = useCallback(
    async (id: string) => {
      const challenge = await request(
        `/api/admin/challenges/${id}/reject`,
        {
          method: 'POST',
          headers: headers(),
          body: JSON.stringify({}),
        }
      );

      return updateLocal(challenge);
    },
    []
  );

  const mine = useMemo(
    () =>
      user
        ? all.filter(
            (challenge) =>
              challenge.submittedByEmail ===
                user.email ||
              challenge.teamApplication
                ?.contactEmail ===
                user.email
          )
        : [],
    [all, user]
  );

  const pendingApprovalCount =
    user?.role === 'admin'
      ? approvalRequests.filter(
          (request) =>
            request.status === 'pending'
        ).length
      : 0;

  return (
    <C.Provider
      value={{
        all,
        mine,
        ready,

        getById: (id) =>
          all.find(
            (challenge) =>
              challenge.id === id
          ),

        duplicateCheck,
        addChallenge,

        claimForTeam,
        submitSolution,

        postProgress,

        expressIndustryInterest,

        sendProposal,
        respondProposal,

        submitCompletion,

        aiSuggestion,
        universityLeaderboard,

        supportChallenge,

        requestVerification,

        approve,
        reject,

        approvalRequests,
        pendingApprovalCount,

        approveRequest,
        rejectRequest,

        deleteChallenge,
        deleteApprovalRequest,

        adminUsers,
        deleteUser,
      }}
    >
      {children}
    </C.Provider>
  );
}

export function useChallenges() {
  const context = useContext(C);

  if (!context) {
    throw new Error(
      'useChallenges must be used inside ChallengeProvider'
    );
  }

  return context;
}
