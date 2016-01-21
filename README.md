# react-rx-elm-architecture

Own notes:

1.  Elmish handling of effects
  1.  Current Solution
    *  executes the updates for the child component manually
    *  close to elm in forward to and initial action
    *  requires an update entry in the top level reducer 
       to handle effects. Can reuse child component's update,
       but still requires manually calling update and proper
       scoping
  2.  Pass full update to Effects.map
    *  could work to handle effect update
    *  might be difficult to reason about proper scope/address
  3.  Make forwardTo a merge operation
    *  actions will have to be streams
    *  update will be address aware and effect will need to be
       a dispatch to the local address stream
2.  Reduxian solution
  1.  Compose all update functions into a single, top level reducer
    *  requires no conflict in action types
    *  this no conflict necessitates redux architecture
       and thus non-nested component logic or careful modularization
3.  Cyclic solution
  1.  Couple updates to the components themselves
    *  need more investigation
    *  seems like tight coupling is a disadvantage
    *  removes need for dispatch etc.
    *  more declarative prop mapping?

