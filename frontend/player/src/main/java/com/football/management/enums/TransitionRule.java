package com.football.management.enums;

import java.util.*;
import java.util.stream.Collectors;

public class TransitionRule {
    
    private static final Map<DemandeStatus, Set<DemandeStatus>> ALLOWED_TRANSITIONS = new HashMap<>();
    
    static {
        ALLOWED_TRANSITIONS.put(DemandeStatus.INITIAL, Set.of(
            DemandeStatus.EN_ATTENTE,
            DemandeStatus.VALIDEE_CLUB,
            DemandeStatus.REJETEE
        ));
        
        ALLOWED_TRANSITIONS.put(DemandeStatus.EN_ATTENTE, Set.of(
            DemandeStatus.VALIDEE_CLUB,
            DemandeStatus.REJETEE,
            DemandeStatus.INITIAL
        ));
        
        ALLOWED_TRANSITIONS.put(DemandeStatus.VALIDEE_CLUB, Set.of(
            DemandeStatus.IMPRIMEE,
            DemandeStatus.EN_ATTENTE
        ));
        
        ALLOWED_TRANSITIONS.put(DemandeStatus.IMPRIMEE, Set.of());
        
        ALLOWED_TRANSITIONS.put(DemandeStatus.REJETEE, Set.of(
            DemandeStatus.INITIAL
        ));
    }
    
    public static boolean isTransitionAllowed(DemandeStatus from, DemandeStatus to) {
        if (from == null || to == null) {
            return false;
        }
        
        if (from == to) {
            return true;
        }
        
        Set<DemandeStatus> allowedTargets = ALLOWED_TRANSITIONS.get(from);
        return allowedTargets != null && allowedTargets.contains(to);
    }
    
    public static Set<DemandeStatus> getAllowedNextStates(DemandeStatus current) {
        return ALLOWED_TRANSITIONS.getOrDefault(current, Set.of());
    }
    
    public static String getTransitionErrorMessage(DemandeStatus from, DemandeStatus to) {
        Set<DemandeStatus> allowed = getAllowedNextStates(from);
        
        if (allowed.isEmpty()) {
            return String.format(
                "La demande est dans un état final ('%s'). Aucune transition n'est possible.",
                from.getLibelle()
            );
        }
        
        return String.format(
            "Transition non autorisée de '%s' vers '%s'. " +
            "Transitions possibles : %s",
            from.getLibelle(),
            to.getLibelle(),
            allowed.stream()
                .map(DemandeStatus::getLibelle)
                .collect(Collectors.joining(", "))
        );
    }
    
    public static boolean canModifyState(DemandeStatus current) {
        return !current.isFinalState();
    }
}