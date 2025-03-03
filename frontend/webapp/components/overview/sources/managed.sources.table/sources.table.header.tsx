import React, { useEffect, useMemo, useState } from 'react';
import { OVERVIEW } from '@/utils';
import theme from '@/styles/palette';
import styled from 'styled-components';
import { UnFocusSources } from '@/assets/icons/side.menu';
import { ActionsGroup, KeyvalText } from '@/design.system';
import {
  K8SSourceTypes,
  ManagedSource,
  Namespace,
  SourceSortOptions,
} from '@/types';

const StyledThead = styled.div`
  background-color: ${theme.colors.light_dark};
  border-top-right-radius: 6px;
  border-top-left-radius: 6px;
`;

const StyledTh = styled.th`
  padding: 10px 20px;
  text-align: left;
  border-bottom: 1px solid ${theme.colors.blue_grey};
`;

const StyledMainTh = styled(StyledTh)`
  padding: 10px 20px;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const ActionGroupContainer = styled.div`
  display: flex;
  justify-content: flex-end;
  padding-right: 20px;
  gap: 24px;
  flex: 1;
`;

interface ActionsTableHeaderProps {
  data: ManagedSource[];
  namespaces?: Namespace[];
  sortSources?: (condition: string) => void;
  filterSourcesByKind?: (kinds: string[]) => void;
  filterSourcesByNamespace?: (namespaces: string[]) => void;
  toggleActionStatus?: (ids: string[], disabled: boolean) => void;
}

export function SourcesTableHeader({
  data,
  namespaces,
  sortSources,
  filterSourcesByKind,
  filterSourcesByNamespace,
}: ActionsTableHeaderProps) {
  const [currentSortId, setCurrentSortId] = useState('');
  const [groupNamespaces, setGroupNamespaces] = useState<string[]>([]);
  const [groupKinds, setGroupKinds] = useState<string[]>([
    K8SSourceTypes.DEPLOYMENT,
    K8SSourceTypes.STATEFUL_SET,
    K8SSourceTypes.DAEMON_SET,
  ]);

  useEffect(() => {
    if (namespaces) {
      setGroupNamespaces(
        namespaces.filter((item) => item.totalApps > 0).map((item) => item.name)
      );
    }
  }, [namespaces]);

  function onSortClick(id: string) {
    setCurrentSortId(id);
    sortSources && sortSources(id);
  }

  function onNamespaceClick(id: string) {
    let newGroup: string[] = [];
    if (groupNamespaces.includes(id)) {
      setGroupNamespaces(groupNamespaces.filter((item) => item !== id));
      newGroup = groupNamespaces.filter((item) => item !== id);
    } else {
      setGroupNamespaces([...groupNamespaces, id]);
      newGroup = [...groupNamespaces, id];
    }

    filterSourcesByNamespace && filterSourcesByNamespace(newGroup);
  }

  function onKindClick(id: string) {
    let newGroup: string[] = [];
    if (groupKinds.includes(id)) {
      setGroupKinds(groupKinds.filter((item) => item !== id));
      newGroup = groupKinds.filter((item) => item !== id);
    } else {
      setGroupKinds([...groupKinds, id]);
      newGroup = [...groupKinds, id];
    }

    filterSourcesByKind && filterSourcesByKind(newGroup);
  }

  const sourcesGroups = useMemo(() => {
    if (!namespaces) return [];

    const totalNamespacesWithApps = namespaces.filter(
      (item) => item.totalApps > 0
    ).length;

    const namespacesItems = namespaces
      .sort((a, b) => b.totalApps - a.totalApps)
      ?.map((item: Namespace, index: number) => ({
        label: `${item.name} (${item.totalApps} apps) `,
        onClick: () => onNamespaceClick(item.name),
        id: item.name,
        selected: groupNamespaces.includes(item.name) && item.totalApps > 0,
        disabled:
          (groupNamespaces.length === 1 &&
            groupNamespaces.includes(item.name)) ||
          item.totalApps === 0 ||
          totalNamespacesWithApps === 1,
      }));

    return [
      {
        label: 'Kind',
        subTitle: 'Filter',
        condition: true,
        items: [
          {
            label: 'Deployment',
            onClick: () => onKindClick(K8SSourceTypes.DEPLOYMENT),
            id: K8SSourceTypes.DEPLOYMENT,
            selected:
              groupKinds.includes(K8SSourceTypes.DEPLOYMENT) &&
              data.some(
                (item) => item.kind.toLowerCase() === K8SSourceTypes.DEPLOYMENT
              ),
            disabled:
              groupKinds.length === 1 &&
              groupKinds.includes(K8SSourceTypes.DEPLOYMENT) &&
              data.some(
                (item) => item.kind.toLowerCase() === K8SSourceTypes.DEPLOYMENT
              ),
          },
          {
            label: 'StatefulSet',
            onClick: () => onKindClick(K8SSourceTypes.STATEFUL_SET),
            id: K8SSourceTypes.STATEFUL_SET,
            selected:
              groupKinds.includes(K8SSourceTypes.STATEFUL_SET) &&
              data.some(
                (item) =>
                  item.kind.toLowerCase() === K8SSourceTypes.STATEFUL_SET
              ),
            disabled:
              (groupKinds.length === 1 &&
                groupKinds.includes(K8SSourceTypes.STATEFUL_SET)) ||
              data.every(
                (item) =>
                  item.kind.toLowerCase() !== K8SSourceTypes.STATEFUL_SET
              ),
          },
          {
            label: 'DemonSet',
            onClick: () => onKindClick(K8SSourceTypes.DAEMON_SET),
            id: K8SSourceTypes.DAEMON_SET,
            selected:
              groupKinds.includes(K8SSourceTypes.DAEMON_SET) &&
              data.some(
                (item) => item.kind.toLowerCase() === K8SSourceTypes.DAEMON_SET
              ),
            disabled:
              (groupKinds.length === 1 &&
                groupKinds.includes(K8SSourceTypes.DAEMON_SET)) ||
              data.every(
                (item) => item.kind.toLowerCase() !== K8SSourceTypes.DAEMON_SET
              ),
          },
        ],
      },
      {
        label: 'Namespaces',
        subTitle: 'Display',
        items: namespacesItems,
        condition: true,
      },
      {
        label: 'Sort by',
        subTitle: 'Sort by',
        items: [
          {
            label: 'Kind',
            onClick: () => onSortClick(SourceSortOptions.KIND),
            id: SourceSortOptions.KIND,
            selected: currentSortId === SourceSortOptions.KIND,
          },
          {
            label: 'Language',
            onClick: () => onSortClick(SourceSortOptions.LANGUAGE),
            id: SourceSortOptions.LANGUAGE,
            selected: currentSortId === SourceSortOptions.LANGUAGE,
          },
          {
            label: 'Name',
            onClick: () => onSortClick(SourceSortOptions.NAME),
            id: SourceSortOptions.NAME,
            selected: currentSortId === SourceSortOptions.NAME,
          },
          {
            label: 'Namespace',
            onClick: () => onSortClick(SourceSortOptions.NAMESPACE),
            id: SourceSortOptions.NAMESPACE,
            selected: currentSortId === SourceSortOptions.NAMESPACE,
          },
        ],
        condition: true,
      },
    ];
  }, [namespaces, groupNamespaces, data]);

  return (
    <StyledThead>
      <StyledMainTh>
        <UnFocusSources style={{ width: 18, height: 18 }} />
        <KeyvalText size={14} weight={600} color={theme.text.white}>
          {`${data.length} ${OVERVIEW.MENU.SOURCES}`}
        </KeyvalText>
        <ActionGroupContainer>
          <ActionsGroup actionGroups={sourcesGroups} />
        </ActionGroupContainer>
      </StyledMainTh>
    </StyledThead>
  );
}
